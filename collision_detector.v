
module collision_detector (
    input wire [9:0] bullet_x,
    input wire [9:0] bullet_y,
    input wire [9:0] enemy_x,
    input wire [9:0] enemy_y,
    output wire hit
);

assign hit =
    (bullet_x + 10'd4 >= enemy_x) &&
    (bullet_x <= enemy_x + 10'd30) &&
    (bullet_y + 10'd12 >= enemy_y) &&
    (bullet_y <= enemy_y + 10'd24);

endmodule
