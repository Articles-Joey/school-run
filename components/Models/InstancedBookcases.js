import React, { useMemo } from 'react'
import { useGLTF, Merged } from '@react-three/drei'

export function InstancedBookcases({ children }) {
  const { nodes } = useGLTF('models/bookcaseClosedDoors-transformed.glb')
  
  const meshes = useMemo(() => ({
    Bookcase: nodes['bookcaseClosedDoors(Clone)'],
    Door: nodes.doorLeft
  }), [nodes])

  return (
    <Merged meshes={meshes}>
      {(instances) => children(instances)}
    </Merged>
  )
}

useGLTF.preload('models/bookcaseClosedDoors-transformed.glb')
