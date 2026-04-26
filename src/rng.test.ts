import { SlotMachineRNG } from "./rng";

const mockCatalog = [
    {    
        id: "cherry", 
        frame: "f1",
        name: "Cherry",
        weight: 10, 
        payouts: { 3: 50 }, 
        tint: 0xffffff
    }    
];

describe("SlotMachineRNG", () => {
    test("Should generate a grid of 3x3", () => {
        const engine = new SlotMachineRNG(mockCatalog);
        const result = engine.generateSpin();

    expect(result.grid.length).toBe(3);
    expect(result.grid[0]!.length).toBe(3);
    });
});