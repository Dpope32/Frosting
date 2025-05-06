import { useRegistryStore } from '@/store/RegistryStore';
import { observable } from '@legendapp/state';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
const kaibaState$ = observable({
    stores: {
        registry: useRegistryStore,
    }
});

const profile$ = observable(({
    get: 'https://myurl/my-profile',
    set: 'https://myurl/my-profile',
    persist: {
      plugin: ObservablePersistLocalStorage,
      name: 'profile',
    },
  }))
  
  




