export interface SymbolData {
    id: string;
    frame: string;
    name: string;
    payouts: { [key: number]: number };
    weight: number;
    tint: number;
}

export interface RNG {
    grid: SymbolData[][];
    totalWin: number;
    isWin: boolean;
}

export class SlotMachineRNG {
    private readonly REEL_COLUMNS = 3;
    private readonly REEL_ROWS = 3;

    constructor(private catalog: SymbolData[]) {}

    private getRandomSymbol(): SymbolData {
        const totalWeight = this.catalog.reduce((sum, s) => sum + s.weight, 0);
        let r = Math.random() * totalWeight;

        for (const symbol of this.catalog) {
            if (r < symbol.weight) return symbol;
            r -= symbol.weight;
        }
        return this.catalog[0]!;
    }

    public generateSpin(): RNG {
        const grid: SymbolData[][] = [];

        for (let c = 0; c < this.REEL_COLUMNS; c++) {
            const column: SymbolData[] = [];

            for (let r = 0; r < this.REEL_ROWS; r++) {
                column.push(this.getRandomSymbol());
            }
            grid.push(column);
        }
        return { 
            grid: grid,
            totalWin: 0,
            isWin: false 
        };
    }
}