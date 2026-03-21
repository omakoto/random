export const VERTEX_SHADER_SRC = `#version 300 es
precision highp float;

in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat3 u_normalMatrix;

out vec3 v_normal;
out vec3 v_fragPos;

void main() {
  vec4 worldPos = u_model * vec4(a_position, 1.0);
  v_fragPos = worldPos.xyz;
  v_normal = normalize(u_normalMatrix * a_normal);
  gl_Position = u_projection * u_view * worldPos;
}
`;

export const FRAGMENT_SHADER_SRC = `#version 300 es
precision highp float;

in vec3 v_normal;
in vec3 v_fragPos;

uniform vec3 u_lightDir;
uniform vec3 u_modelColor;
uniform vec3 u_viewPos;

out vec4 fragColor;

void main() {
  vec3 normal = normalize(v_normal);

  // Ambient
  float ambientStrength = 0.2;
  vec3 ambient = ambientStrength * u_modelColor;

  // Diffuse
  float diff = max(dot(normal, normalize(u_lightDir)), 0.0);
  vec3 diffuse = diff * u_modelColor;

  // Specular (Blinn-Phong)
  vec3 viewDir = normalize(u_viewPos - v_fragPos);
  vec3 halfDir = normalize(normalize(u_lightDir) + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
  vec3 specular = 0.4 * spec * vec3(1.0);

  // Back-face tinting
  float facingRatio = dot(normal, viewDir);
  if (facingRatio < 0.0) {
    fragColor = vec4(0.3, 0.15, 0.15, 1.0);
    return;
  }

  fragColor = vec4(ambient + diffuse + specular, 1.0);
}
`;
