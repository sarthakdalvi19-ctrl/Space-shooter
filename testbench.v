
`timescale 1ns/1ps

module testbench;

reg clk = 0;
reg reset = 0;

// Score counter signals
reg enemy_destroyed = 0;
wire [15:0] score;

// Collision detector signals
reg [9:0] bullet_x = 100;
reg [9:0] bullet_y = 100;
reg [9:0] enemy_x = 100;
reg [9:0] enemy_y = 100;
wire hit;

// Game controller signals
reg start = 0;
reg player_hit = 0;
wire [1:0] state;
wire game_over;

score_counter score_unit (
    .clk(clk),
    .reset(reset),
    .enemy_destroyed(enemy_destroyed),
    .score(score)
);

collision_detector collision_unit (
    .bullet_x(bullet_x),
    .bullet_y(bullet_y),
    .enemy_x(enemy_x),
    .enemy_y(enemy_y),
    .hit(hit)
);

game_controller controller_unit (
    .clk(clk),
    .reset(reset),
    .start(start),
    .player_hit(player_hit),
    .state(state),
    .game_over(game_over)
);

always #5 clk = ~clk;

initial begin
    $dumpfile("space_shooter.vcd");
    $dumpvars(0, testbench);

    // Reset the game
    reset = 1;
    #10;
    reset = 0;

    // Start the game
    start = 1;
    #10;
    start = 0;

    // Destroy two enemies
    enemy_destroyed = 1;
    #10;
    enemy_destroyed = 0;
    #10;

    enemy_destroyed = 1;
    #10;
    enemy_destroyed = 0;
    #10;

    $display("Score after two enemies = %0d", score);
    $display("Collision detected = %0b", hit);
    $display("Game state = %0d", state);

    // Simulate the player being hit
    player_hit = 1;
    #10;
    player_hit = 0;

    $display("Game over = %0b", game_over);

    if (score == 20 && hit == 1 && game_over == 1)
        $display("TEST PASSED");
    else
        $display("TEST FAILED");

    $finish;
end

endmodule
