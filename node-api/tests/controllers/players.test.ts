import { MongoDBContainer, StartedMongoDBContainer } from "@testcontainers/mongodb";
import request from "supertest";
import mongoose from "mongoose";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from "firebase/auth";
import app from "../../app.js";
import Player from "../../src/models/players.js";
import * as externalService from "../../src/services/externalPlayer.service.js";

let mongoContainer: StartedMongoDBContainer;
const auth = getAuth(initializeApp({ apiKey: "test-api-key", projectId: "msc-soccer-project" }));
connectAuthEmulator(auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
let token: string;

jest.mock("../../src/services/externalPlayer.service.js");

const mockPlayer = {
    name: "Neymar", firstName: "Neymar", lastName: "Jr", age: 34, birthdate: "1992-02-05",
    nationality: "Brazil", height: 1.75, weight: 68, number: 10, team: "Santos",
    league: "Serie A", position: "Attacker", photoUrl: "http://test.com", latitude: 0, longitude: 0
};

describe("Players Controller Comprehensive Tests", () => {
    beforeAll(async () => {
        mongoContainer = await new MongoDBContainer("mongo:7.0.34-jammy").withExposedPorts(27017).start();
        await mongoose.connect(`mongodb://${mongoContainer.getHost()}:${mongoContainer.getMappedPort(27017)}/test?directConnection=true`);
        const userCredential = await signInWithEmailAndPassword(auth, "admin@example.com", "123456");
        token = await userCredential.user.getIdToken();
    }, 60000);

    afterAll(async () => { await mongoose.disconnect(); await mongoContainer.stop(); });
    beforeEach(async () => { await Player.deleteMany({}); jest.clearAllMocks(); });

    test("GET /api/players: coverage for query, dateStart, and catch", async () => {
        await Player.create(mockPlayer);

        const res1 = await request(app).get("/api/players?query=Santos&dateStart=2026-01-01&dateEnd=2026-05-27");
        expect(res1.status).toBe(200);

        jest.spyOn(Player, 'find').mockImplementationOnce(() => ({ select: () => ({ exec: () => { throw new Error(); } }) } as any));
        const res2 = await request(app).get("/api/players");
        expect(res2.status).toBe(500);
    });

    test("GET /api/players/summary: coverage for mapping and catch", async () => {
        await Player.create(mockPlayer);
        const res = await request(app).get("/api/players/summary");
        expect(res.status).toBe(200);
        jest.spyOn(Player, 'find').mockImplementationOnce(() => ({ select: () => ({ exec: () => { throw new Error(); } }) } as any));
        expect((await request(app).get("/api/players/summary")).status).toBe(500);
    });

    test("GET /api/players/:id: coverage for validation, 404, and comments logic", async () => {
        const p = await Player.create(mockPlayer);

        expect((await request(app).get("/api/players/123")).status).toBe(404);

        expect((await request(app).get(`/api/players/${new mongoose.Types.ObjectId()}`)).status).toBe(404);

        const res = await request(app).get(`/api/players/${p._id}`);
        expect(res.status).toBe(200);
    });

    test("GET /api/players/name/:id: coverage for validation and not found", async () => {
        const p = await Player.create(mockPlayer);
        expect((await request(app).get("/api/players/name/123")).status).toBe(404);
        expect((await request(app).get(`/api/players/name/${new mongoose.Types.ObjectId()}`)).status).toBe(404);
        expect((await request(app).get(`/api/players/name/${p._id}`)).status).toBe(200);
    });

    test("POST /api/players: create and catch", async () => {
        const res = await request(app).post("/api/players").set("Authorization", `Bearer ${token}`).send(mockPlayer);
        expect(res.status).toBe(201);
        jest.spyOn(Player.prototype, 'save').mockImplementationOnce(() => { throw new Error(); });
        expect((await request(app).post("/api/players").set("Authorization", `Bearer ${token}`).send(mockPlayer)).status).toBe(500);
    });

    test("PUT /api/players/:id: validation, 404 and update", async () => {
        const p = await Player.create(mockPlayer);
        expect((await request(app).put("/api/players/123").set("Authorization", `Bearer ${token}`).send({})).status).toBe(404);
        const res = await request(app).put(`/api/players/${p._id}`).set("Authorization", `Bearer ${token}`).send({ name: "Updated" });
        expect(res.status).toBe(200);
        expect((await request(app).put(`/api/players/${new mongoose.Types.ObjectId()}`).set("Authorization", `Bearer ${token}`).send({})).status).toBe(404);
    });

    test("DELETE /api/players/:id: validation, 404 and success", async () => {
        const p = await Player.create(mockPlayer);
        expect((await request(app).delete("/api/players/123").set("Authorization", `Bearer ${token}`)).status).toBe(404);
        expect((await request(app).delete(`/api/players/${new mongoose.Types.ObjectId()}`).set("Authorization", `Bearer ${token}`)).status).toBe(404);
        expect((await request(app).delete(`/api/players/${p._id}`).set("Authorization", `Bearer ${token}`)).status).toBe(204);
    });

    test("GET/POST /api/players/search/import: service coverage", async () => {
        (externalService.searchPlayers as jest.Mock).mockResolvedValue([]);
        expect((await request(app).get("/api/players/search?query=test").set("Authorization", `Bearer ${token}`)).status).toBe(200);
        
        (externalService.importAndSavePlayer as jest.Mock).mockResolvedValue(mockPlayer);
        expect((await request(app).post("/api/players/import").set("Authorization", `Bearer ${token}`).send({ playerIds: [1], latitude: 0, longitude: 0 })).status).toBe(201);
        
        jest.spyOn(externalService, 'importAndSavePlayer').mockImplementationOnce(() => { throw new Error(); });
        expect((await request(app).post("/api/players/import").set("Authorization", `Bearer ${token}`).send({ playerIds: [1] })).status).toBe(500);
    });
});
