precision highp float;

varying vec2 v_texcoord;
varying vec3 v_normal;

uniform float clock;

uniform sampler2D texture_day;
uniform sampler2D texture_night;

float TWO_PI = 6.283185307179586;

void main(void) {
  float turn = clock * TWO_PI;
  vec3 sun = normalize(vec3(sin(turn), cos(turn), 0.0));

  gl_FragColor = mix(texture2D(texture_day, v_texcoord), texture2D(texture_night, v_texcoord), dot(sun, normalize(v_normal))+0.8);
}
