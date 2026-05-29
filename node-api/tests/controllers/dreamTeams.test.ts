import { MongoDBContainer, StartedMongoDBContainer } from "@testcontainers/mongodb";
import request from "supertest";
import mongoose from "mongoose";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from "firebase/auth";
import app from "../../app.js";
import DreamTeam from "../../src/models/dreamTeams.js";
import Player from "../../src/models/players.js";
import { DreamTeamService } from "../../src/services/dreamTeam.service.js";

jest.mock("../../src/services/dreamTeam.service.js");

let mongoContainer: StartedMongoDBContainer;
const auth = getAuth(initializeApp({ apiKey: "test-api-key", projectId: "msc-soccer-project" }));
connectAuthEmulator(auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);

let token: string;
let testUid: string;

describe("DreamTeams Controller Integration Tests", () => {
    beforeAll(async () => {
        mongoContainer = await new MongoDBContainer("mongo:7.0.34-jammy").withExposedPorts(27017).start();
        await mongoose.connect(`mongodb://${mongoContainer.getHost()}:${mongoContainer.getMappedPort(27017)}/test?directConnection=true`);
        
        const userCredential = await signInWithEmailAndPassword(auth, "admin@example.com", "123456");
        token = await userCredential.user.getIdToken();
        testUid = userCredential.user.uid;
    }, 60000);

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoContainer.stop();
    });

    beforeEach(async () => {
        await DreamTeam.deleteMany({});
        await Player.deleteMany({});
        jest.clearAllMocks();
    });

    test("GET /api/dream-teams: should retrieve user teams", async () => {
        const p = await Player.create({ name: "Neymar", latitude: 0, longitude: 0 });
        await DreamTeam.create({ userId: testUid, name: "My Team", playerIds: [p._id] });

        const res = await request(app)
            .get("/api/dream-teams")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body[0].players[0].name).toBe("Neymar");
    });

    test("POST /api/dream-teams: should generate team successfully", async () => {
        const p = await Player.create({ name: "Messi", latitude: 0, longitude: 0 });

        (DreamTeamService.prototype.generateDreamTeam as jest.Mock).mockResolvedValue({
            _id: "123",
            name: "Best Team",
            userId: testUid,
            playerIds: [p._id]
        });

        const res = await request(app)
            .post("/api/dream-teams")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(201);
        expect(res.body.name).toBe("Best Team");
    });

    test("POST /api/dream-teams: should return 422 if service returns empty playerIds", async () => {
        (DreamTeamService.prototype.generateDreamTeam as jest.Mock).mockResolvedValue({
            playerIds: [] 
        });

        const res = await request(app)
            .post("/api/dream-teams")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(422);
    });

    test("POST /api/dream-teams: should return 500 if service throws error", async () => {
        (DreamTeamService.prototype.generateDreamTeam as jest.Mock).mockRejectedValue(new Error("AI API Down"));
        
        const res = await request(app)
            .post("/api/dream-teams")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(500);
    });
});
