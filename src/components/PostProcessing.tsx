// @ts-nocheck
import { FC } from 'react';
import { 
  EffectComposer, 
  Bloom, 
  Vignette, 
  ChromaticAberration, 
  Noise 
} from '@react-three/postprocessing';
import * as THREE from 'three';

// Cast post-processing components with JSX type incompatibilities to React.FC
const ChromaticAberrationComponent = ChromaticAberration as FC<any>;
const NoiseComponent = Noise as FC<any>;
const VignetteComponent = Vignette as FC<any>;

interface PostProcessingProps {
  selectedPart: string | null;
}

export function PostProcessing({ selectedPart: _selectedPart }: PostProcessingProps) {
  // No Depth of Field — it was causing the model to appear blurry.
  // We keep only subtle cinematic bloom, vignette, and grain for premium feel.
  return (
    <EffectComposer multisampling={8}>
      {/* Subtle bloom on bright highlights and reflections */}
      <Bloom 
        intensity={0.35} 
        luminanceThreshold={0.92} 
        luminanceSmoothing={0.04} 
        mipmapBlur 
      />

      {/* Very subtle chromatic aberration at screen edges */}
      <ChromaticAberrationComponent 
        offset={new THREE.Vector2(0.0005, 0.0005)} 
      />

      {/* Subtle film grain to break digital perfection */}
      <NoiseComponent 
        opacity={0.012} 
      />

      {/* Vignette to draw focus to the center car */}
      <VignetteComponent 
        eskil={false} 
        offset={0.25} 
        darkness={0.85} 
      />
    </EffectComposer>
  );
}
