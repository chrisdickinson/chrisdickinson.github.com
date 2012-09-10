precision highp float;

attribute vec3 a_position;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;
varying vec3 v_normal;

uniform mat4 model;
uniform mat4 perspective;

float TWO_PI = 6.283185307179586;
float PI = 3.141592653589793;
float PI_2 = 1.5707963267948966;

void main(void) {
  v_texcoord = a_texcoord;
  v_normal = normalize(a_position);
  gl_Position = perspective * model * vec4(a_position, 1.0);
  
}
