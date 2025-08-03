import React from 'react'
import { YStack, XStack } from 'tamagui'
import { TypingAnimation } from './TypingAnimation'
import { GoogleButton, AppleButton, DownloadButton, ManifestoButton } from './HeroButtons'
import { Hone } from './hone'
import { typingTexts } from '@/constants/typingTexts' 
import { ContinueButton } from './ContinueButton'
import { Pills } from './Pills'
    
    interface HeroProps { scrollOffset: number; onComplete: () => void }
    
    export const HeroSection = ({ scrollOffset, onComplete }: HeroProps) => {
      return (
        <YStack alignItems="center" gap="$8" width="100%" position="relative" zi={1}>
          <Hone />
            <TypingAnimation texts={typingTexts} speed={80} deleteSpeed={50} pauseTime={2000} />
              <ContinueButton onComplete={onComplete} scrollOffset={scrollOffset} />
              <Pills />

              <XStack gap="$5" >
                <AppleButton onPress={() => window.open('https://apps.apple.com/us/app/kaiba-nexus/id6743065823', '_blank')} />
                <DownloadButton onPress={() => window.open('https://github.com/kaiba-nexus/kaiba-nexus/releases', '_blank')} />
                <GoogleButton onPress={() => window.open('https://play.google.com/store/apps/details?id=com.kaiba.nexus', '_blank')} />
                <ManifestoButton onPress={() => window.open('https://deedaw.cc/pages/notes.html/kaiba-authorDeeDaw', '_blank')} />
              </XStack>

        </YStack>
      )
    }
