var t;let e=[];function i(t){let e=Math.sqrt(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]);return e>0?[t[0]/e,t[1]/e,t[2]/e]:[0,0,0]}function r(t,e){return[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]]}function a(t,e){return[t[0]*e,t[1]*e,t[2]*e]}function o(t,e){return[t[0]+e[0],t[1]+e[1],t[2]+e[2]]}t=new class{load(t){return this.loadBinary(t)}loadBinary(t){let e=new DataView(t),i=e.getUint32(80,!0),r=new Float32Array(9*i),a=new Float32Array(9*i),o=84;for(let t=0;t<i;t++){let i=e.getFloat32(o,!0),n=e.getFloat32(o+4,!0),s=e.getFloat32(o+8,!0);for(let l=0;l<3;l++){let h=o+12+12*l,d=9*t+3*l;r[d]=e.getFloat32(h,!0),r[d+1]=e.getFloat32(h+4,!0),r[d+2]=e.getFloat32(h+8,!0),a[d]=i,a[d+1]=n,a[d+2]=s}o+=50}return{vertices:r,normals:a,triangleCount:i}}constructor(){this.extensions=["stl"]}},e.push(t);let n=`#version 300 es
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
`,s=`#version 300 es
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
`;function l(t,e,i){let r=t.createShader(e);if(t.shaderSource(r,i),t.compileShader(r),!t.getShaderParameter(r,t.COMPILE_STATUS)){let e=t.getShaderInfoLog(r);throw t.deleteShader(r),Error(`Shader compile error: ${e}`)}return r}let h=document.getElementById("gl-canvas"),d=document.getElementById("file-input"),c=document.getElementById("file-name"),m=document.getElementById("view-toggle"),u=document.getElementById("reset-view"),v=document.getElementById("view-mode-label"),g=document.getElementById("model-info"),f=document.getElementById("drop-hint"),p=new class{constructor(t){this.canvas=t,this.theta=Math.PI/4,this.phi=Math.PI/4,this.radius=5,this.target=[0,0,0],this.viewMode="perspective",this.orthoScale=1,this.aspect=1,this.dragging=null,this.lastX=0,this.lastY=0,this.modelCenter=[0,0,0],this.modelSize=1,this.attachEvents()}setAspect(t){this.aspect=t}setViewMode(t){this.viewMode=t}getViewMode(){return this.viewMode}toggleViewMode(){return this.viewMode="perspective"===this.viewMode?"isometric":"perspective",this.viewMode}fitToModel(t,e){this.target=[...t],this.radius=2*e,this.orthoScale=1.5*e}getEyePosition(){return[this.target[0]+this.radius*Math.cos(this.phi)*Math.cos(this.theta),this.target[1]+this.radius*Math.sin(this.phi),this.target[2]+this.radius*Math.cos(this.phi)*Math.sin(this.theta)]}getViewMatrix(){var t,e,i;let r,a,o,n,s,l,h,d,c,m,u,v,g,f,p,w,M,_;return t=this.getEyePosition(),e=this.target,i=[0,1,0],r=e[0]-t[0],a=e[1]-t[1],n=Math.sqrt(r*r+a*a+(o=e[2]-t[2])*o),s=r/n,l=a/n,h=o/n,d=l*i[2]-h*i[1],c=h*i[0]-s*i[2],u=Math.sqrt(d*d+c*c+(m=s*i[1]-l*i[0])*m),v=d/u,p=(g=c/u)*h-(f=m/u)*l,w=f*s-v*h,M=v*l-g*s,(_=new Float32Array(16))[0]=v,_[4]=g,_[8]=f,_[12]=-(v*t[0]+g*t[1]+f*t[2]),_[1]=p,_[5]=w,_[9]=M,_[13]=-(p*t[0]+w*t[1]+M*t[2]),_[2]=-s,_[6]=-l,_[10]=-h,_[14]=s*t[0]+l*t[1]+h*t[2],_[3]=0,_[7]=0,_[11]=0,_[15]=1,_}getProjectionMatrix(){var t,e,i,r;if("perspective"===this.viewMode){let i,r,a;return t=Math.PI/4,e=this.aspect,i=1/Math.tan(t/2),r=-1/9999.99,(a=new Float32Array(16))[0]=i/e,a[5]=i,a[10]=10000.01*r,a[11]=-1,a[14]=200*r,a}{let t,e,a,o=this.orthoScale,n=o*this.aspect;return i=-n,r=-o,t=new Float32Array(16),e=1/(i-n),a=1/(r-o),t[0]=-2*e,t[5]=-2*a,t[10]=-1e-4,t[12]=(i+n)*e,t[13]=(o+r)*a,t[14]=-0,t[15]=1,t}}reset(t,e){this.theta=Math.PI/4,this.phi=Math.PI/4,this.target=[...t],this.radius=2*e,this.orthoScale=1.5*e}setModelInfo(t,e){this.modelCenter=t,this.modelSize=e}attachEvents(){let t=this.canvas;t.addEventListener("mousedown",t=>{1===t.button&&(t.preventDefault(),this.dragging=t.shiftKey?"pan":"orbit",this.lastX=t.clientX,this.lastY=t.clientY)}),window.addEventListener("mousemove",t=>{if(!this.dragging)return;let e=t.clientX-this.lastX,i=t.clientY-this.lastY;this.lastX=t.clientX,this.lastY=t.clientY,"orbit"===this.dragging?this.orbit(e,i):this.pan(e,i)}),window.addEventListener("mouseup",t=>{1===t.button&&(this.dragging=null)}),t.addEventListener("wheel",t=>{t.preventDefault();let e=t.deltaY>0?1.1:.9;this.radius*=e,this.orthoScale*=e;let i=.05*this.modelSize,r=100*this.modelSize;this.radius=Math.max(i,Math.min(r,this.radius)),this.orthoScale=Math.max(.5*i,Math.min(.5*r,this.orthoScale))},{passive:!1}),t.addEventListener("contextmenu",t=>t.preventDefault())}orbit(t,e){this.theta-=.005*t,this.phi+=.005*e;let i=Math.PI/2-.01;this.phi=Math.max(-i,Math.min(i,this.phi))}pan(t,e){var n;let s=this.getEyePosition(),l=i((n=this.target,[n[0]-s[0],n[1]-s[1],n[2]-s[2]])),h=i(r(l,[0,1,0])),d=i(r(h,l)),c=.001*this.radius,m=o(a(h,-t*c),a(d,e*c));this.target=o(this.target,m)}}(h),w=new class{constructor(t,e){this.canvas=t,this.camera=e,this.vertexCount=0,this.modelCenter=[0,0,0],this.modelSize=1,this.animFrameId=0,this.dirty=!0;let i=t.getContext("webgl2");if(!i)throw Error("WebGL2 not supported");this.gl=i,this.program=function(t,e,i){let r=t.createProgram();if(t.attachShader(r,l(t,t.VERTEX_SHADER,e)),t.attachShader(r,l(t,t.FRAGMENT_SHADER,i)),t.linkProgram(r),!t.getProgramParameter(r,t.LINK_STATUS))throw Error(`Program link error: ${t.getProgramInfoLog(r)}`);return r}(i,n,s),this.vao=i.createVertexArray(),i.enable(i.DEPTH_TEST),i.enable(i.CULL_FACE),i.cullFace(i.BACK),i.clearColor(.1,.1,.18,1),this.startRenderLoop()}loadModel(t){let e=this.gl,i=1/0,r=1/0,a=1/0,o=-1/0,n=-1/0,s=-1/0;for(let e=0;e<t.vertices.length;e+=3){let l=t.vertices[e],h=t.vertices[e+1],d=t.vertices[e+2];l<i&&(i=l),l>o&&(o=l),h<r&&(r=h),h>n&&(n=h),d<a&&(a=d),d>s&&(s=d)}this.modelCenter=[(i+o)/2,(r+n)/2,(a+s)/2];let l=o-i,h=n-r,d=s-a;this.modelSize=Math.sqrt(l*l+h*h+d*d),this.camera.fitToModel(this.modelCenter,this.modelSize),this.camera.setModelInfo(this.modelCenter,this.modelSize),e.bindVertexArray(this.vao);let c=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,c),e.bufferData(e.ARRAY_BUFFER,t.vertices,e.STATIC_DRAW);let m=e.getAttribLocation(this.program,"a_position");e.enableVertexAttribArray(m),e.vertexAttribPointer(m,3,e.FLOAT,!1,0,0);let u=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,u),e.bufferData(e.ARRAY_BUFFER,t.normals,e.STATIC_DRAW);let v=e.getAttribLocation(this.program,"a_normal");e.enableVertexAttribArray(v),e.vertexAttribPointer(v,3,e.FLOAT,!1,0,0),e.bindVertexArray(null),this.vertexCount=3*t.triangleCount,this.dirty=!0}markDirty(){this.dirty=!0}startRenderLoop(){let t=()=>{this.resize(),this.render(),this.animFrameId=requestAnimationFrame(t)};this.animFrameId=requestAnimationFrame(t)}resize(){let t=this.canvas,e=window.devicePixelRatio||1,i=Math.floor(t.clientWidth*e),r=Math.floor(t.clientHeight*e);(t.width!==i||t.height!==r)&&(t.width=i,t.height=r,this.camera.setAspect(i/r),this.dirty=!0)}render(){var t;let e,i,r,a,o,n,s,l,h,d,c,m,u,v,g;if(!this.dirty)return;this.dirty=!1;let f=this.gl;if(f.viewport(0,0,this.canvas.width,this.canvas.height),f.clear(f.COLOR_BUFFER_BIT|f.DEPTH_BUFFER_BIT),0===this.vertexCount)return;f.useProgram(this.program);let p=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),w=this.camera.getViewMatrix(),M=this.camera.getProjectionMatrix(),_=(e=(t=function(t,e){let i=new Float32Array(16);for(let r=0;r<4;r++)for(let a=0;a<4;a++){let o=0;for(let i=0;i<4;i++)o+=t[4*i+r]*e[4*a+i];i[4*a+r]=o}return i}(w,p))[0],i=t[1],r=t[2],a=t[4],o=t[5],n=t[6],s=t[8],l=t[9],d=(h=t[10])*o-n*l,v=0==(u=e*d+i*(c=-h*a+n*s)+r*(m=l*a-o*s))?0:1/u,(g=new Float32Array(9))[0]=d*v,g[1]=(-h*i+r*l)*v,g[2]=(n*i-r*o)*v,g[3]=c*v,g[4]=(h*e-r*s)*v,g[5]=(-n*e+r*a)*v,g[6]=m*v,g[7]=(-l*e+i*s)*v,g[8]=(o*e-i*a)*v,g),y=this.camera.getEyePosition(),A=t=>f.getUniformLocation(this.program,t);f.uniformMatrix4fv(A("u_model"),!1,p),f.uniformMatrix4fv(A("u_view"),!1,w),f.uniformMatrix4fv(A("u_projection"),!1,M),f.uniformMatrix3fv(A("u_normalMatrix"),!1,_),f.uniform3fv(A("u_lightDir"),[1,2,3]),f.uniform3fv(A("u_modelColor"),[.6,.75,.9]),f.uniform3fv(A("u_viewPos"),y),f.bindVertexArray(this.vao),f.drawArrays(f.TRIANGLES,0,this.vertexCount),f.bindVertexArray(null)}getModelCenter(){return this.modelCenter}getModelSize(){return this.modelSize}}(h,p);async function M(t){var i;let r,a=(i=t.name,r=i.split(".").pop()?.toLowerCase()??"",e.find(t=>t.extensions.includes(r))??null);if(!a)return void alert(`Unsupported file format: ${t.name.split(".").pop()}`);try{let e=await t.arrayBuffer(),i=a.load(e);w.loadModel(i),c.textContent=t.name,f.classList.add("hidden"),g.textContent=`${i.triangleCount.toLocaleString()} triangles`}catch(t){console.error(t),alert(`Failed to load file: ${t instanceof Error?t.message:String(t)}`)}}h.addEventListener("mousedown",()=>w.markDirty()),window.addEventListener("mousemove",()=>w.markDirty()),window.addEventListener("mouseup",()=>w.markDirty()),h.addEventListener("wheel",()=>w.markDirty(),{passive:!1}),d.addEventListener("change",async()=>{let t=d.files?.[0];t&&await M(t)}),h.addEventListener("dragover",t=>{t.preventDefault()}),h.addEventListener("drop",async t=>{t.preventDefault();let e=t.dataTransfer?.files?.[0];e&&await M(e)}),m.addEventListener("click",()=>{let t=p.toggleViewMode();m.textContent="perspective"===t?"Switch to Isometric":"Switch to Perspective",v.textContent="perspective"===t?"Perspective View":"Isometric View",w.markDirty()}),u.addEventListener("click",()=>{p.reset(w.getModelCenter(),w.getModelSize()),w.markDirty()});
//# sourceMappingURL=stl-viewer.4173a7da.js.map
