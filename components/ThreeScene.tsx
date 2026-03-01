'use client'

import styles from "../styles.module.css";

import React,{ useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
//fat line
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

export default function ThreeScene(){
  const vertexShader:string=`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `;
  const fragmentShader:string=`
    uniform sampler2D baseTexture;
    uniform sampler2D bloomTexture;
    varying vec2 vUv;
    void main() {
      gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
    }
  `;

  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const currentMount = mountRef.current;
    if (!currentMount) return;
    //PP params
    const bloomParams = {
      threshold: 0.2,
      strength: .25,
      radius: 0.2,
      exposure: .2
    };

    const outlineParams = {
				edgeStrength: 9.0,
				edgeGlow: 0.0,
				edgeThickness: 3.0,
				pulsePeriod: 2.5,
				usePatternTexture: false,
        visibleEdgeColor:new THREE.Color(0xff0000),
        hiddenEdgeColor:new THREE.Color(0x550000)
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(.75,0.1,.75);
    camera.lookAt(new THREE.Vector3(0,0,0));

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(2);
    mountRef.current?.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize( window.innerWidth, window.innerHeight );
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    mountRef.current?.appendChild( labelRenderer.domElement );
    //setup camera controller
    const controls = new OrbitControls( camera, labelRenderer.domElement );
    //controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    //controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.maxPolarAngle = Math.PI / 2;

    const loader = new GLTFLoader();
    const clock = new THREE.Clock();
    let pcObj:THREE.Group;
    let loaded:boolean = false;
    let elapsedTime:number = 0;
    //fans
    let caseFanSpeed:number = 5;
    let cpuFanSpeed:number = 5;
    let gpuFanSpeed:number = 5;
    let _CaseFanObj:THREE.Object3D;
    let _CPUFanObj:THREE.Object3D;
    let _GPUFanObj:THREE.Object3D;
    let _CPUObj:THREE.Object3D;
    let _GPUObj:THREE.Object3D;
    let _CPUObjPos:THREE.Vector3;
    let _GPUObjPos:THREE.Vector3;
        
    let highlightObjects:THREE.Object3D[] = [];
    let _cpuLine:Line2;
    let _gpuLine:Line2;

    const renderPass = new RenderPass( scene, camera );
    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    bloomPass.threshold = bloomParams.threshold;
    bloomPass.strength = bloomParams.strength;
    bloomPass.radius = bloomParams.radius;

    const outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
    outlinePass.edgeStrength =	outlineParams.edgeStrength;
    outlinePass.edgeGlow =	outlineParams.edgeGlow;
    outlinePass.edgeThickness = outlineParams.edgeThickness;
    outlinePass.pulsePeriod =	outlineParams.pulsePeriod;
    outlinePass.usePatternTexture=	outlineParams.usePatternTexture;
    outlinePass.visibleEdgeColor = outlineParams.visibleEdgeColor;
    outlinePass.hiddenEdgeColor = outlineParams.hiddenEdgeColor;

    const bloomComposer = new EffectComposer( renderer );
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass( renderPass );
    bloomComposer.addPass( bloomPass );

    const mixPass = new ShaderPass(
      new THREE.ShaderMaterial( {
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        defines: {}
      } ), 'baseTexture'
    );
    mixPass.needsSwap = true;

    const outputPass = new OutputPass();

    const finalComposer = new EffectComposer( renderer );
    finalComposer.addPass( renderPass );
    finalComposer.addPass( mixPass );
    finalComposer.addPass( outputPass );
    finalComposer.addPass( outlinePass );
    
    //0xFF5400
    const light1 = new THREE.DirectionalLight(0xFFFFFF,2);
    //light1.target = cube;
    light1.position.set(-2.5,2,2.5);

    const light2 = new THREE.DirectionalLight(0xFFFFFF,2);
    //light2.target = cube;
    light2.position.set(2.5,2,-2.5);

    scene.add(light1);
    scene.add(light2);
    //scene.add(cube);

    loader.load( 'PC.glb', function ( gltf ) {
				pcObj = gltf.scene;
        
        pcObj.children.map((obj,idx)=>{
          //console.log(`${idx} ${obj.name} ${obj.type}`);
          if(obj.name=='_CaseFan')
            _CaseFanObj = obj;
          if(obj.name=='_CPUFan')
            _CPUFanObj = obj;
          if(obj.name=='_GPUFan')
            _GPUFanObj = obj;
          if(obj.name=='CPU'){
            _CPUObj = obj;
            _CPUObjPos = GetObjectCenterPos(_CPUObj);
            cpuLabel.position.set(_CPUObjPos.x,_CPUObjPos.y,_CPUObjPos.z);
            cpuLabel.visible=true;
          }
          if(obj.name=='GPU'){
            _GPUObj = obj;
            _GPUObjPos = GetObjectCenterPos(_GPUObj);
            gpuLabel.position.set(_GPUObjPos.x,_GPUObjPos.y,_GPUObjPos.z);
            gpuLabel.visible=true;
          }
          if(_CPUObj!=null&&_GPUObj!=null)
            [_cpuLine,_gpuLine]=SetupLines(scene);
        });

        loaded = true;
				scene.add( pcObj );
        
        //get object center for cameral control
        controls.target = GetObjectCenterPos(pcObj);
        //set objects to be outlined
        if(_CPUObj!=null)highlightObjects.push(_CPUObj);
        if(_GPUObj!=null)highlightObjects.push(_GPUObj);
        outlinePass.selectedObjects = highlightObjects;
        //UpdateEnvmap(pcObj,renderer);
		}, undefined, function ( e ) {
				console.error( e );
    } );

    //CSS labels
    const cpuDiv = document.createElement( 'div' );
    cpuDiv.className = `${styles.circle}`;
    const cpuLabel = new CSS2DObject( cpuDiv );
    cpuLabel.visible=false;
    cpuLabel.center.set( .5, .5 );
    scene.add(cpuLabel);
    const gpuDiv = document.createElement( 'div' );
    gpuDiv.className = `${styles.circle}`;
    const gpuLabel = new CSS2DObject( gpuDiv );
    gpuLabel.visible=false;
    gpuLabel.center.set( .5, .5 );
    scene.add(gpuLabel);


    const render = () => {
      const delta = clock.getDelta();
      elapsedTime += delta;

      controls.update();

      if(_CaseFanObj != null)
        _CaseFanObj.rotateY(-caseFanSpeed*delta);
      if(_CPUFanObj != null)
        _CPUFanObj.rotateY(-cpuFanSpeed*delta);
      if(_GPUFanObj != null)
        _GPUFanObj.rotateZ(-gpuFanSpeed*delta);
      if(_CPUFanObj != null&&_GPUFanObj != null)
        UpdateLines(camera,_CPUObjPos,_GPUObjPos,_cpuLine,_gpuLine);
      
      bloomComposer.render();
      finalComposer.render();
      labelRenderer.render(scene,camera);
      //renderer.render(scene, camera);
      requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      labelRenderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  });
  return <div ref={mountRef} />; 
}

function GetObjectCenterPos(obj:THREE.Object3D):THREE.Vector3{
  let center = new THREE.Vector3();
  let aabb = new THREE.Box3();
  aabb.setFromObject( obj );
  aabb.getCenter(center);
  return center;
}

function SetupLines(scene:THREE.Scene):Line2[]{
    const lineGeo1 = new LineGeometry();
    const lineGeo2 = new LineGeometry();
    const lineMat = new LineMaterial( {
      color: 0xff0000,
      linewidth: 1.5,
      dashed: false,
      alphaToCoverage: true,
      depthTest:false
    } );

    const line1=new Line2(lineGeo1,lineMat);
    const line2=new Line2(lineGeo2,lineMat);
    line1.renderOrder = 1;
    line2.renderOrder = 1;
    scene.add(line1);
    scene.add(line2);
    return [line1,line2];
}

function UpdateLines(
  camera:THREE.PerspectiveCamera,
  cpuPos:THREE.Vector3,
  gpuPos:THREE.Vector3,
  cpuLine:Line2,
  gpuLine:Line2,
){
   const newPos:number[]=[];
   const pos1=new THREE.Vector3(-.4,.199,-.99).unproject(camera);
   newPos.push(cpuPos.x,cpuPos.y,cpuPos.z,pos1.x,pos1.y,pos1.z);
   cpuLine.geometry.setPositions(newPos);
   cpuLine.computeLineDistances();
   const newPos2:number[]=[];
   const pos2=new THREE.Vector3(.4,.199,-.99).unproject(camera);
   newPos2.push(gpuPos.x,gpuPos.y,gpuPos.z,pos2.x,pos2.y,pos2.z);
   gpuLine.geometry.setPositions(newPos2);
   gpuLine.computeLineDistances();
}

function UpdateEnvmap(pcObj:THREE.Group,renderer:THREE.WebGLRenderer){
  
  const pmremGenerator = new THREE.PMREMGenerator( renderer );
  pmremGenerator.compileEquirectangularShader();
  let exrCubeRenderTarget:THREE.WebGLRenderTarget;
  THREE.DefaultLoadingManager.onLoad = ()=>pmremGenerator.dispose();
  new EXRLoader().load( './ferndale_studio_04_1k.exr', function ( tex ) {
			tex.mapping = THREE.EquirectangularReflectionMapping;
      exrCubeRenderTarget = pmremGenerator.fromEquirectangular( tex );
      
      pcObj.children.map((obj)=>{
        if(obj instanceof THREE.Mesh){
          (obj.material as THREE.MeshStandardMaterial).metalness =.5;
          (obj.material as THREE.MeshStandardMaterial).roughness =.5;
          (obj.material as THREE.MeshStandardMaterial).envMapIntensity=0.5;
          (obj.material as THREE.MeshStandardMaterial).envMap=exrCubeRenderTarget.texture;
          (obj.material as THREE.MeshStandardMaterial).needsUpdate=true;
        }
      });
  });
}