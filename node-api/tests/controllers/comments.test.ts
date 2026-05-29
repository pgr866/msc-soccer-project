import { MongoDBContainer, StartedMongoDBContainer } from "@testcontainers/mongodb";
import request from "supertest";
import mongoose from "mongoose";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from "firebase/auth";
import app from "../../app.js";
import Player from "../../src/models/players.js";

let mongoContainer: StartedMongoDBContainer;
const auth = getAuth(initializeApp({ apiKey: "test-api-key", projectId: "msc-soccer-project" }));
connectAuthEmulator(auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
let token: string;

const mockPlayer = {
    name: "Neymar", latitude: 0, longitude: 0,
    comments: [{ author: "user1", text: "great", rating: 5, latitude: 0, longitude: 0 }]
};

const mockComment = { text: "amazing", rating: 5, latitude: 0, longitude: 0 };

describe("Comments Controller Integration Tests", () => {
    beforeAll(async () => {
        mongoContainer = await new MongoDBContainer("mongo:7.0.34-jammy").withExposedPorts(27017).start();
        await mongoose.connect(`mongodb://${mongoContainer.getHost()}:${mongoContainer.getMappedPort(27017)}/test?directConnection=true`);
        const userCredential = await signInWithEmailAndPassword(auth, "admin@example.com", "123456");
        token = await userCredential.user.getIdToken();
    }, 60000);

    afterAll(async () => { await mongoose.disconnect(); await mongoContainer.stop(); });
    beforeEach(async () => { await Player.deleteMany({}); });

    describe("GET /api/comments/player/:id", () => {
        test("should return 404 for invalid ID or non-existent player", async () => {
            expect((await request(app).get("/api/comments/player/123")).status).toBe(404);
            expect((await request(app).get(`/api/comments/player/${new mongoose.Types.ObjectId()}`)).status).toBe(404);
        });

        test("should return comments for valid player", async () => {
            const p = await Player.create(mockPlayer);
            const res = await request(app).get(`/api/comments/player/${p._id}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe("POST /api/comments/player/:id", () => {
        test("should create comment (anonymous if no token)", async () => {
            const p = await Player.create(mockPlayer);
            const res = await request(app).post(`/api/comments/player/${p._id}`).send(mockComment);
            expect(res.status).toBe(201);
            expect(res.body.author).toBe("anonymous");
        });

        test("should handle validation errors", async () => {
            expect((await request(app).post("/api/comments/player/123").send(mockComment)).status).toBe(404);
        });
    });

    describe("DELETE /api/comments/:id", () => {
        test("should delete comment", async () => {
            const p = await Player.create(mockPlayer);
            const commentId = p.comments![0]?._id;
            const res = await request(app)
                .delete(`/api/comments/${commentId}`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(204);
        });

        test("should return 404 if comment not found", async () => {
            const res = await request(app)
                .delete(`/api/comments/${new mongoose.Types.ObjectId()}`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(404);
        });
    });

    describe("Error Handling (Coverage)", () => {
        test("should return 500 when DB fails", async () => {
            jest.spyOn(Player, 'findById').mockImplementationOnce(() => ({ exec: () => { throw new Error(); } }) as any);
            const res = await request(app).get(`/api/comments/player/${new mongoose.Types.ObjectId()}`);
            expect(res.status).toBe(500);
        });
    });
});
