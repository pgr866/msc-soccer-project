import request from "supertest";
import { MongoDBContainer, StartedMongoDBContainer } from "@testcontainers/mongodb";
import mongoose from "mongoose";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from "firebase/auth";

process.env.GROQ_API_KEY = "test-key";

import { DreamTeamService } from "../../src/services/dreamTeam.service.js";
import app from "../../app.js";
import DreamTeam from "../../src/models/dreamTeams.js";
import Player from "../../src/models/players.js";

jest.mock("../../src/services/dreamTeam.service.js");

let mongoContainer: StartedMongoDBContainer;
const auth = getAuth(initializeApp({ apiKey: "test-api-key", projectId: "msc-soccer-project" }));

connectAuthEmulator(auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);

let token: string;

describe("DreamTeams Controller Integration Tests", () => {
    beforeAll(async () => {
        mongoContainer = await new MongoDBContainer("mongo:7.0.34-jammy").withExposedPorts(27017).start();
        await mongoose.connect(mongoContainer.getConnectionString() + "/test?directConnection=true");

        const userCredential = await signInWithEmailAndPassword(auth, "admin@example.com", "123456");
        token = await userCredential.user.getIdToken();
    }, 120000);

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoContainer.stop();
    });

    beforeEach(async () => {
        await DreamTeam.deleteMany({});
        await Player.deleteMany({});
        jest.clearAllMocks();
    });

    test("POST /api/dream-teams: should generate team successfully", async () => {
        const mockGenerate = jest.fn().mockResolvedValue({
            name: "Dream Team",
            playerIds: ["6a1cd77193f48dd4e68ffc73"]
        });
        (DreamTeamService.prototype.generateDreamTeam as jest.Mock) = mockGenerate;

        const p = await Player.create({ name: "Messi", latitude: 0, longitude: 0 });
        const res = await request(app)
            .post("/api/dream-teams")
            .set("Authorization", `Bearer ${token}`)
            .send({ playerIds: [p._id.toString()] });

        expect(res.status).toBe(201);
    });

    test("POST /api/dream-teams: should return 422 if service returns empty playerIds", async () => {
        (DreamTeamService.prototype.generateDreamTeam as jest.Mock).mockResolvedValue({
            name: "Empty Team",
            playerIds: []
        });

        const res = await request(app)
            .post("/api/dream-teams")
            .set("Authorization", `Bearer ${token}`)
            .send({ playerIds: [] });

        expect(res.status).toBe(422);
    });

    test("POST /api/dream-teams: should return 500 if service throws error", async () => {
        (DreamTeamService.prototype.generateDreamTeam as jest.Mock).mockRejectedValue(new Error("AI Service Failed"));

        const res = await request(app)
            .post("/api/dream-teams")
            .set("Authorization", `Bearer ${token}`)
            .send({ playerIds: ["123"] });

        expect(res.status).toBe(500);
    });
});
