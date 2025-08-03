import { H1, isWeb } from 'tamagui'
import { Dimensions } from 'react-native'
import React from 'react'

export const Hone = () => {
  const w = Dimensions.get('window').width
  const mobile = isWeb && w <= 768
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
        <div
          style={{
            position: 'absolute',
            top: '-20%', 
            left: '51%', 
            transform: 'translate(-50%, -50%)',
            width: '1440px',
            height: '1440px',
            background: 'radial-gradient(circle, rgba(0, 247, 255, 1) 0%, rgba(0, 191, 255, 0.8) 30%, rgba(0, 191, 255, 0.4) 60%, transparent 100%)',
            filter: 'blur(4px)',
            zIndex: 0,
            borderRadius: '50%',
            opacity: 0.025,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-20%', 
            left: '51%', 
            transform: 'translate(-50%, -50%)',
            width: '720px',
            height: '720px',
            background: 'radial-gradient(circle, rgba(0, 247, 255, 1) 0%, rgba(0, 191, 255, 0.8) 30%, rgba(0, 191, 255, 0.4) 60%, transparent 100%)',
            filter: 'blur(4px)',
            zIndex: 0,
            borderRadius: '50%',
            opacity: 0.05,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-20%', 
            left: '51%', 
            transform: 'translate(-50%, -50%)',
            width: '240px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(0, 247, 255, 1) 0%, rgba(0, 191, 255, 0.8) 30%, rgba(0, 191, 255, 0.4) 60%, transparent 100%)',
            filter: 'blur(4px)',
            zIndex: 0,
            borderRadius: '50%',
            opacity: 0.1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-20%', 
            left: '51%', 
            transform: 'translate(-50%, -50%)',
            width: '180px',
            height: '180px',
            background: 'radial-gradient(circle, rgba(0, 247, 255, 1) 0%, rgba(0, 191, 255, 0.8) 30%, rgba(0, 191, 255, 0.4) 60%, transparent 100%)',
            filter: 'blur(4px)',
            zIndex: 0,
            borderRadius: '50%',
            opacity: 0.1,
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '-20%', 
            left: '51%', 
            transform: 'translate(-50%, -50%)',
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(0, 247, 255, 1) 0%, rgba(0, 191, 255, 0.8) 30%, rgba(0, 191, 255, 0.4) 60%, transparent 100%)',
            filter: 'blur(4px)',
            zIndex: 0,
            borderRadius: '50%',
            opacity: 0.1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-20%', 
            left: '51%', 
            transform: 'translate(-50%, -50%)',
            width: '60px',
            height: '60px',
            background: 'radial-gradient(circle, rgba(0, 247, 255, 1) 0%, rgba(0, 191, 255, 0.8) 30%, rgba(0, 191, 255, 0.4) 60%, transparent 100%)',
            filter: 'blur(4px)',
            zIndex: 0,
            borderRadius: '50%',
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-20%', 
            left: '51%', 
            transform: 'translate(-50%, -50%)',
            width: '30px',
            height: '30px',
            background: 'radial-gradient(circle, rgba(0, 247, 255, 1) 0%, rgb(0, 247, 255) 30%, rgba(0, 255, 234, 0.4) 60%, transparent 100%)',
            filter: 'blur(4px)',
            zIndex: 0,
            borderRadius: '50%',
            opacity: 0.9,
          }}
        />

      
      <H1
        fontFamily="$heading"
        fontSize={isWeb ? (mobile ? '$9' : Math.min(w * 0.14, 140)) : '$8'}
        fontWeight="700"
        textAlign="center"
        style={{
          position: 'relative',
          zIndex: 1,
          background: isWeb 
            ? 'linear-gradient(90deg,rgb(0, 174, 255) 0%,rgb(0, 247, 255) 50%, rgb(0, 174, 255) 100%)'
            : 'rgb(0, 174, 255)',
          WebkitBackgroundClip: isWeb ? 'text' : undefined,
          backgroundClip: isWeb ? 'text' : undefined,
          WebkitTextFillColor: isWeb ? 'transparent' : undefined,
          color: isWeb ? 'transparent' : '#00BFFF',
          letterSpacing: '-.02em',
        }}
      >
        Kaiba
      </H1>
    </div>
  )
}