import type { MatchWrapper } from "shared/wrappers/match";
import type { Position } from "shared/schemas/position";

// Mock the performAction function
let mockPerformActionCalls: any[] = [];

// Create a testable version of PerformActionAdapter that uses our mock
class TestablePerformActionAdapter {
  constructor(private match: MatchWrapper) {}

  private async performAction(match: any, action: any, isSimulation: boolean) {
    mockPerformActionCalls.push({ match, action, isSimulation });
  }

  async moveUnit(unitId: string, path: Position[]): Promise<void> {
    const [type, x, y] = unitId.split("-");
    const fromPosition: Position = [parseInt(x), parseInt(y)];
    
    const unit = this.match.getUnit(fromPosition);
    if (!unit) {
      throw new Error(`No unit found with ID ${unitId}`);
    }

    const action = {
      type: "move",
      path: path,
      playerId: unit.player.data.id,
      subAction: { type: "wait" },
    };

    await this.performAction(this.match, action, true);
  }

  async attackWithUnit(unitId: string, targetPosition: Position): Promise<void> {
    const [type, x, y] = unitId.split("-");
    const fromPosition: Position = [parseInt(x), parseInt(y)];
    
    const unit = this.match.getUnit(fromPosition);
    if (!unit) {
      throw new Error(`No unit found with ID ${unitId}`);
    }

    const path = [fromPosition];

    const action = {
      type: "move",
      path: path,
      playerId: unit.player.data.id,
      subAction: {
        type: "attack",
        targetPosition: targetPosition,
      },
    };

    await this.performAction(this.match, action, true);
  }

  async buildUnit(unitType: string, position: Position): Promise<void> {
    const currentPlayer = this.match.getCurrentTurnPlayer();
    
    const action = {
      type: "build",
      position: position,
      playerId: currentPlayer.data.id,
      unitType: unitType,
    };

    await this.performAction(this.match, action, true);
  }

  async captureProperty(unitId: string, position: Position): Promise<void> {
    const [type, x, y] = unitId.split("-");
    const fromPosition: Position = [parseInt(x), parseInt(y)];
    
    const unit = this.match.getUnit(fromPosition);
    if (!unit) {
      throw new Error(`No unit found with ID ${unitId}`);
    }

    const path = fromPosition[0] === position[0] && fromPosition[1] === position[1]
      ? [fromPosition]
      : [fromPosition, position];

    const action = {
      type: "move",
      path: path,
      playerId: unit.player.data.id,
      subAction: { type: "ability" },
    };

    await this.performAction(this.match, action, true);
  }

  async endTurn(): Promise<void> {
    const currentPlayer = this.match.getCurrentTurnPlayer();
    
    const action = {
      type: "passTurn",
      playerId: currentPlayer.data.id,
    };

    await this.performAction(this.match, action, true);
  }

  async loadUnit(unitId: string, transportId: string): Promise<void> {
    const [unitType, ux, uy] = unitId.split("-");
    const [transportType, tx, ty] = transportId.split("-");
    const unitPos: Position = [parseInt(ux), parseInt(uy)];
    const transportPos: Position = [parseInt(tx), parseInt(ty)];
    
    const unit = this.match.getUnit(unitPos);
    if (!unit) {
      throw new Error(`No unit found with ID ${unitId}`);
    }

    const path = [unitPos, transportPos];
    
    const action = {
      type: "move",
      path: path,
      playerId: unit.player.data.id,
      subAction: { type: "wait" },
    };

    await this.performAction(this.match, action, true);
  }

  async unloadUnit(
    transportId: string,
    unitPosition: Position,
    dropPosition: Position
  ): Promise<void> {
    const [type, x, y] = transportId.split("-");
    const transportPos: Position = [parseInt(x), parseInt(y)];
    
    const transport = this.match.getUnit(transportPos);
    if (!transport) {
      throw new Error(`No transport found with ID ${transportId}`);
    }

    const path = transportPos[0] === unitPosition[0] && transportPos[1] === unitPosition[1]
      ? [transportPos]
      : [transportPos, unitPosition];

    const action = {
      type: "move",
      path: path,
      playerId: transport.player.data.id,
      subAction: {
        type: "unloadWait",
        unitIndices: [0],
        dropPositions: [dropPosition],
      },
    };

    await this.performAction(this.match, action, true);
  }

  async isActionValid(action: any): Promise<boolean> {
    return true;
  }
}

// Helper to create a mock match
function createMockMatch(): MatchWrapper {
  const mockPlayers = [
    {
      data: {
        id: "player1",
        hasCurrentTurn: true,
        slot: 0,
      },
      team: { index: 0 },
    },
    {
      data: {
        id: "player2",
        hasCurrentTurn: false,
        slot: 1,
      },
      team: { index: 1 },
    },
  ];

  const mockUnits = new Map<string, any>();
  
  return {
    getCurrentTurnPlayer: () => mockPlayers[0],
    getAllPlayers: () => mockPlayers,
    getUnit: (position: Position) => {
      const key = `${position[0]},${position[1]}`;
      return mockUnits.get(key);
    },
    addMockUnit: (position: Position, playerId: string) => {
      const key = `${position[0]},${position[1]}`;
      mockUnits.set(key, {
        data: { position, type: "infantry" },
        player: mockPlayers.find(p => p.data.id === playerId),
      });
    },
  } as any;
}

// Simple test assertions
function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toEqual(expected: T) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toHaveLength(expected: number) {
      if (!Array.isArray(actual)) {
        throw new Error(`Expected array but got ${typeof actual}`);
      }
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected} but got ${actual.length}`);
      }
    },
    toContain(expected: string) {
      if (typeof actual !== "string") {
        throw new Error(`Expected string but got ${typeof actual}`);
      }
      if (!actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
    },
    not: {
      toBeNull() {
        if (actual === null) {
          throw new Error(`Expected value not to be null`);
        }
      }
    }
  };
}

// Run tests
async function runTests() {
  console.log("Running PerformActionAdapter tests...\n");
  
  let passed = 0;
  let failed = 0;

  // Test moveUnit
  console.log("Testing moveUnit:");
  
  // Test 1: Should create move action
  try {
    mockPerformActionCalls = [];
    const match = createMockMatch();
    match.addMockUnit([3, 4], "player1");
    const adapter = new TestablePerformActionAdapter(match);
    const path: Position[] = [[3, 4], [4, 4], [5, 4]];
    
    await adapter.moveUnit("infantry-3-4", path);

    expect(mockPerformActionCalls).toHaveLength(1);
    const call = mockPerformActionCalls[0];
    expect(call.action.type).toBe("move");
    expect(call.action.path).toEqual(path);
    expect(call.action.playerId).toBe("player1");
    expect(call.action.subAction.type).toBe("wait");
    expect(call.isSimulation).toBe(true);
    
    console.log("  ✓ Should create move action with wait subaction");
    passed++;
  } catch (error) {
    console.log("  ✗ Should create move action with wait subaction");
    if (error instanceof Error) console.log(`    ${error.message}`);
    failed++;
  }

  // Test 2: Should throw error if unit not found
  try {
    mockPerformActionCalls = [];
    const match = createMockMatch();
    const adapter = new TestablePerformActionAdapter(match);
    
    let error: Error | null = null;
    try {
      await adapter.moveUnit("infantry-999-999", [[999, 999]]);
    } catch (e) {
      error = e as Error;
    }
    
    expect(error).not.toBeNull();
    expect(error?.message).toContain("No unit found");
    
    console.log("  ✓ Should throw error if unit not found");
    passed++;
  } catch (error) {
    console.log("  ✗ Should throw error if unit not found");
    if (error instanceof Error) console.log(`    ${error.message}`);
    failed++;
  }

  // Test buildUnit
  console.log("\nTesting buildUnit:");
  
  try {
    mockPerformActionCalls = [];
    const match = createMockMatch();
    const adapter = new TestablePerformActionAdapter(match);
    const position: Position = [5, 5];
    
    await adapter.buildUnit("tank", position);

    expect(mockPerformActionCalls).toHaveLength(1);
    const call = mockPerformActionCalls[0];
    expect(call.action.type).toBe("build");
    expect(call.action.position).toEqual(position);
    expect(call.action.unitType).toBe("tank");
    expect(call.action.playerId).toBe("player1");
    
    console.log("  ✓ Should create build action");
    passed++;
  } catch (error) {
    console.log("  ✗ Should create build action");
    if (error instanceof Error) console.log(`    ${error.message}`);
    failed++;
  }

  // Test attackWithUnit
  console.log("\nTesting attackWithUnit:");
  
  try {
    mockPerformActionCalls = [];
    const match = createMockMatch();
    match.addMockUnit([2, 2], "player1");
    const adapter = new TestablePerformActionAdapter(match);
    const targetPosition: Position = [3, 2];
    
    await adapter.attackWithUnit("infantry-2-2", targetPosition);

    expect(mockPerformActionCalls).toHaveLength(1);
    const call = mockPerformActionCalls[0];
    expect(call.action.type).toBe("move");
    expect(call.action.subAction.type).toBe("attack");
    expect(call.action.subAction.targetPosition).toEqual(targetPosition);
    expect(call.action.playerId).toBe("player1");
    
    console.log("  ✓ Should create move action with attack subaction");
    passed++;
  } catch (error) {
    console.log("  ✗ Should create move action with attack subaction");
    if (error instanceof Error) console.log(`    ${error.message}`);
    failed++;
  }

  // Test captureProperty
  console.log("\nTesting captureProperty:");
  
  try {
    mockPerformActionCalls = [];
    const match = createMockMatch();
    const position: Position = [3, 3];
    match.addMockUnit(position, "player1");
    const adapter = new TestablePerformActionAdapter(match);
    
    await adapter.captureProperty("infantry-3-3", position);

    expect(mockPerformActionCalls).toHaveLength(1);
    const call = mockPerformActionCalls[0];
    expect(call.action.type).toBe("move");
    expect(call.action.path).toEqual([position]);
    expect(call.action.subAction.type).toBe("ability");
    
    console.log("  ✓ Should create move action with ability subaction when on property");
    passed++;
  } catch (error) {
    console.log("  ✗ Should create move action with ability subaction when on property");
    if (error instanceof Error) console.log(`    ${error.message}`);
    failed++;
  }

  // Test endTurn
  console.log("\nTesting endTurn:");
  
  try {
    mockPerformActionCalls = [];
    const match = createMockMatch();
    const adapter = new TestablePerformActionAdapter(match);
    
    await adapter.endTurn();

    expect(mockPerformActionCalls).toHaveLength(1);
    const call = mockPerformActionCalls[0];
    expect(call.action.type).toBe("passTurn");
    expect(call.action.playerId).toBe("player1");
    
    console.log("  ✓ Should create passTurn action");
    passed++;
  } catch (error) {
    console.log("  ✗ Should create passTurn action");
    if (error instanceof Error) console.log(`    ${error.message}`);
    failed++;
  }

  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
}

runTests().catch(console.error);