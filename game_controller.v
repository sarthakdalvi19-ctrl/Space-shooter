
module game_controller (
    input wire clk,
    input wire reset,
    input wire start,
    input wire player_hit,
    output reg [1:0] state,
    output wire game_over
);

localparam READY = 2'd0;
localparam PLAYING = 2'd1;
localparam GAME_OVER = 2'd2;

assign game_over = (state == GAME_OVER);

always @(posedge clk or posedge reset) begin
    if (reset) begin
        state <= READY;
    end else begin
        case (state)
            READY: begin
                if (start)
                    state <= PLAYING;
            end

            PLAYING: begin
                if (player_hit)
                    state <= GAME_OVER;
            end

            GAME_OVER: begin
                if (start)
                    state <= PLAYING;
            end

            default: state <= READY;
        endcase
    end
end

endmodule
