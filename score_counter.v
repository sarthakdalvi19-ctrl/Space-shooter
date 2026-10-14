
module score_counter (
    input wire clk,
    input wire reset,
    input wire enemy_destroyed,
    output reg [15:0] score
);

always @(posedge clk or posedge reset) begin
    if (reset)
        score <= 16'd0;
    else if (enemy_destroyed)
        score <= score + 16'd10;
end

endmodule
