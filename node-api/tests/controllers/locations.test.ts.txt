import { MongoDBContainer, StartedMongoDBContainer } from "@testcontainers/mongodb";
import request from "supertest";
import mongoose from "mongoose";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from "firebase/auth";
import app from "../../app.js";
import Loc from "../../src/models/locations.js";

let mongoContainer: StartedMongoDBContainer;
const auth = getAuth(initializeApp({ apiKey: "test-api-key", projectId: "msc-soccer-project" }));
connectAuthEmulator(auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
let token: string;

const reqAddLocation = {
    name: "Test Location",
    address: "Street 123",
    rating: 5
};

describe("Locations API", () => {
    beforeAll(async () => {
        mongoContainer = await new MongoDBContainer("mongo:7.0.34-jammy").withExposedPorts(27017).start();
        const host = mongoContainer.getHost();
        const port = mongoContainer.getMappedPort(27017);
        const uri = `mongodb://${host}:${port}/test?directConnection=true`;
        await mongoose.connect(uri);
        
        const userCredential = await signInWithEmailAndPassword(auth, "admin@example.com", "123456");
        token = await userCredential.user.getIdToken();
    }, 60000);

    beforeEach(async () => {
        await Loc.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoContainer.stop();
    });

    test("POST /api/locations should create a location", async () => {
        const res = await request(app).post("/api/locations").send(reqAddLocation);
        expect(res.status).toBe(201);
    });

    test("GET /api/locations should return all locations", async () => {
        await Loc.create(reqAddLocation);
        const res = await request(app).get("/api/players").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].name).toBe(reqAddLocation.name);
    });

    test("GET /api/locations/:locationId should return the location", async () => {
        const postRes = await request(app).post("/api/locations").send(reqAddLocation);
        const id = postRes.body._id;

        const res = await request(app).get(`/api/locations/${id}`);
        expect(res.status).toBe(200);
        expect(res.body.name).toBe(reqAddLocation.name);
    });

    test("DELETE /api/locations/:locationId should return 204", async () => {
        const postRes = await request(app).post("/api/locations").send(reqAddLocation);
        const id = postRes.body._id;

        const res = await request(app).delete(`/api/locations/${id}`);
        expect(res.status).toBe(204);
    });

    test("GET /api/locations/:id should return 404 if not found", async () => {
        const fakeId = "60c72b2f9b1d8b0015f3e4e4"; 
        const res = await request(app).get(`/api/locations/${fakeId}`);
        expect(res.status).toBe(404);
    });
});
