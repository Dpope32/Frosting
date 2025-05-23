import { router } from 'expo-router';
import { handleSharedContact } from '@/services';
import type { NotificationResponse } from 'expo-notifications';

export function handleDeepLink(event: { url: string | NotificationResponse }) {  
  if (typeof event.url === 'object' && 'notification' in event.url) {
    const url = event.url.notification.request.content.data?.url;
    if (url) {
      router.push(url.replace('kaiba-nexus://', '/(drawer)/'));
      return;
    }
  }

  if (typeof event.url === 'string' && event.url.startsWith('kaiba-nexus://share')) {
    const url = new URL(event.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const contactData = {
      name: decodeURIComponent(params.name || ''),
      nickname: params.nickname ? decodeURIComponent(params.nickname) : undefined,
      phoneNumber: params.phone ? decodeURIComponent(params.phone) : undefined,
      email: params.email ? decodeURIComponent(params.email) : undefined,
      occupation: params.occupation ? decodeURIComponent(params.occupation) : undefined
    };
    handleSharedContact(contactData);
  } else if (typeof event.url === 'string' && event.url.startsWith('kaiba-nexus://habits')) {
    router.push('/(drawer)/habits');
  }
}