"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  Environment,
  ContactShadows,
  Float,
  MeshTransmissionMaterial,
  MeshDistortMaterial,
  Sparkles,
  useTexture,
} from "@react-three/drei"
import { Zap, Mail, Shield, ArrowRight, ChevronDown, Coins, Send, Globe, Sparkles as SparklesIcon, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MathUtils } from "three"

interface TokenModelProps {
  position?: [number, number, number]
  scale?: number
  color?: string
  visible?: boolean
  animationState?: "idle" | "inserting" | "hovering" | "sending"
}

function TokenModel({ 
  position = [0, 0, 0], 
  scale = 1, 
  color = "#8b5cf6", 
  visible = true, 
  animationState = "idle" 
}: TokenModelProps) {
  const mesh = useRef<THREE.Mesh>(null!)
  const innerRing = useRef<THREE.Group>(null!)
  
  useFrame((state) => {
    if (!mesh.current || !visible) return
    
    // Base rotation
    mesh.current.rotation.y += 0.01
    
    // Different animation states
    switch(animationState) {
      case "inserting":
        mesh.current.position.y = MathUtils.lerp(mesh.current.position.y, position[1], 0.1)
        mesh.current.scale.setScalar(MathUtils.lerp(mesh.current.scale.x, scale, 0.1))
        break
      case "hovering":
        mesh.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 2) * 0.05
        break
      case "sending":
        mesh.current.position.z -= 0.2
        mesh.current.rotation.x += 0.02
        break
      default:
        // idle state
        mesh.current.rotation.z = Math.sin(state.clock.getElapsedTime()) * 0.05
    }
    
    // Inner ring animation
    if (innerRing.current) {
      innerRing.current.rotation.x = state.clock.getElapsedTime() * 0.5
      innerRing.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
  })

  if (!visible) return null

  return (
    <group position={position} scale={scale}>
      <mesh ref={mesh} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 64]} />
        <MeshDistortMaterial
          color={color}
          speed={1.5}
          distort={0.3}
          radius={1}
          metalness={0.9}
          roughness={0.1}
          transmission={0.7}
          thickness={0.5}
          envMapIntensity={1}
        />
      </mesh>

      <group ref={innerRing}>
        <mesh position={[0, 0, 0.06]} castShadow>
          <torusGeometry args={[0.3, 0.02, 16, 64]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={1}
            roughness={0.1}
            emissive="#ffffff"
            emissiveIntensity={0.7}
          />
        </mesh>
        
        <mesh position={[0, 0, 0.07]} castShadow>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.9}
            roughness={0.05}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      <Sparkles 
        count={15} 
        scale={0.8} 
        size={3} 
        speed={0.4} 
        opacity={0.8}
      />
    </group>
  )
}

interface EmailToken {
  id: number
  position: [number, number, number]
  color: string
  state: "inserting" | "hovering" | "sending"
}

interface EmailModelProps {
  position?: [number, number, number]
  scale?: number
}

function EmailModel({ position = [0, 0, 0], scale = 1 }: EmailModelProps) {
  const group = useRef<THREE.Group>(null!)
  const lid = useRef<THREE.Group>(null!)
  const [tokens, setTokens] = useState<EmailToken[]>([])
  const [animationState, setAnimationState] = useState<"closed" | "opening" | "open" | "closing">("closed")
  const [sendAnimation, setSendAnimation] = useState(false)
  
  useEffect(() => {
    const timeoutIds: NodeJS.Timeout[] = []
    
    const runSequence = async () => {
      // Start closed
      setAnimationState("closed")
      await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 1000)))
      
      // Open email
      setAnimationState("opening")
      await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 1200)))
      setAnimationState("open")
      
      // Add tokens one by one with better timing
      for (let i = 0; i < 3; i++) {
        setTokens(prev => [
          ...prev,
          {
            id: i,
            position: [-0.4 + i * 0.4, 0.15, 0],
            color: ["#8b5cf6", "#3b82f6", "#ec4899"][i],
            state: "inserting"
          }
        ])
        await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 600)))
      }
      
      // Change token state to hovering after insertion
      await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 800)))
      setTokens(prev => prev.map(t => ({ ...t, state: "hovering" })))
      
      // Close email
      await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 1500)))
      setAnimationState("closing")
      await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 1000)))
      setAnimationState("closed")
      
      // Send animation
      await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 300)))
      setSendAnimation(true)
      setTokens(prev => prev.map(t => ({ ...t, state: "sending" })))
      
      // Reset after sending
      await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 2000)))
      setSendAnimation(false)
      setTokens([])
      
      // Restart sequence
      runSequence()
    }
    
    runSequence()
    
    return () => timeoutIds.forEach(clearTimeout)
  }, [])

  useFrame((state) => {
    if (!group.current || !lid.current) return
    
    // Base floating animation
    group.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1
    
    // Lid animation based on state
    switch(animationState) {
      case "opening":
        lid.current.rotation.x = MathUtils.lerp(lid.current.rotation.x, Math.PI * 0.6, 0.1)
        break
      case "closing":
        lid.current.rotation.x = MathUtils.lerp(lid.current.rotation.x, 0, 0.1)
        break
    }
    
    // Send animation
    if (sendAnimation) {
      group.current.position.z -= 0.2
      group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, -0.3, 0.05)
      group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, 0.4, 0.05)
      
      // Reset when off screen
      if (group.current.position.z < -15) {
        group.current.position.set(...position)
        group.current.rotation.set(0, 0, 0)
      }
    }
  })

  return (
    <group ref={group} position={position} scale={scale}>
      {/* Email body with improved materials */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.1, 1.1]} />
        <MeshTransmissionMaterial
          samples={8}
          thickness={0.5}
          roughness={0.1}
          transmission={0.95}
          ior={1.5}
          chromaticAberration={0.1}
          anisotropy={0.3}
          color="#4f46e5"
          metalness={0.7}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Email sides */}
      <mesh position={[0, 0.05, -0.55]}>
        <boxGeometry args={[1.6, 0.2, 0.05]} />
        <meshStandardMaterial color="#4f46e5" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.05, 0.55]}>
        <boxGeometry args={[1.6, 0.2, 0.05]} />
        <meshStandardMaterial color="#4f46e5" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.8, 0.05, 0]}>
        <boxGeometry args={[0.05, 0.2, 1.1]} />
        <meshStandardMaterial color="#4f46e5" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.8, 0.05, 0]}>
        <boxGeometry args={[0.05, 0.2, 1.1]} />
        <meshStandardMaterial color="#4f46e5" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Email interior */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[1.5, 0.01, 1]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>

      {/* Email logo */}
      <mesh position={[0, 0.071, 0]}>
        <circleGeometry args={[0.25, 32]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          emissive="#3b82f6" 
          emissiveIntensity={0.7}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Email lid */}
      <group ref={lid} position={[0, 0.05, -0.55]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.05, 1.1]} />
          <meshStandardMaterial color="#6366f1" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Tokens inside email */}
      {tokens.map((token) => (
        <TokenModel
          key={token.id}
          position={token.position}
          color={token.color}
          scale={0.35}
          visible={animationState !== "closed"}
          animationState={token.state}
        />
      ))}

      {/* Send effects */}
      {sendAnimation && (
        <>
          <Sparkles 
            count={100} 
            scale={[3, 2, 3]} 
            size={3} 
            speed={0.5} 
            color="#8b5cf6"
            position={[0, 0, -2]}
          />
          <mesh position={[0, 0, -1]}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial 
              color="#8b5cf6" 
              transparent 
              opacity={0.3} 
              emissive="#8b5cf6"
              emissiveIntensity={2}
            />
          </mesh>
        </>
      )}
    </group>
  )
}

function FloatingTokens() {
  return (
    <>
      {[...Array(8)].map((_, i) => {
        const color = ["#8b5cf6", "#3b82f6", "#ec4899"][i % 3]
        const size = 0.4 + Math.random() * 0.3
        return (
          <Float
            key={i}
            speed={1 + Math.random()}
            rotationIntensity={0.5 + Math.random()}
            floatIntensity={1 + Math.random()}
            position={[
              -4 + Math.random() * 8,
              1 + Math.random() * 4,
              -4 + Math.random() * 8
            ]}
          >
            <TokenModel 
              scale={size} 
              color={color}
              animationState="hovering"
            />
          </Float>
        )
      })}
    </>
  )
}

function ParticleField() {
  const particles = useMemo(() => {
    const count = 1500
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const color = new THREE.Color()
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      
      // Color based on position
      const hue = (positions[i * 3] + 10) / 20 * 0.5 + 0.6
      color.setHSL(hue, 0.8, 0.5)
      color.toArray(colors, i * 3)
    }
    
    return { positions, colors }
  }, [])

  const points = useRef<THREE.Points>(null!)
  
  useFrame((state) => {
    if (!points.current) return
    points.current.rotation.y = state.clock.getElapsedTime() * 0.05
    points.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.7}
        alphaTest={0.01}
      />
    </points>
  )
}

export default function Scene() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">Flow Mail</div>
          <div className="space-x-4">
            <Button 
              variant="ghost" 
              className="text-white hover:text-white hover:bg-white/10"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
              onClick={() => router.push('/login')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen">
        {/* 3D Canvas */}
        <div className="absolute inset-0">
          <Canvas 
            shadows 
            camera={{ position: [0, 2, 8], fov: 45 }}
            gl={{ antialias: true }}
          >
            <color attach="background" args={["#0a0f1a"]} />
            
            <ambientLight intensity={0.7} color="#3b82f6" />
            <directionalLight
              position={[5, 10, 5]}
              intensity={2}
              castShadow
              shadow-mapSize={[2048, 2048]}
              color="#ffffff"
            />
            <pointLight position={[-5, 5, -5]} intensity={0.8} color="#8b5cf6" />
            <pointLight position={[0, -5, 5]} intensity={0.5} color="#3b82f6" />
            
            <EmailModel position={[0, 0, 0]} scale={1.2} />
            <FloatingTokens />
            <ParticleField />
            
            <ContactShadows 
              position={[0, -1.5, 0]} 
              opacity={0.8} 
              scale={10} 
              blur={2.5} 
              far={4} 
              color="#4f46e5"
            />
          </Canvas>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 pt-32 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
              The Future of Email is Here
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Experience seamless communication with integrated token transfers. 
              Send emails and crypto in one beautiful interface.
            </p>
            <div className="space-x-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                onClick={() => router.push('/login')}
              >
                Get Started <ArrowRight className="ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="text-white border-white/20 hover:bg-white/10"
              >
                Learn More <ChevronDown className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

