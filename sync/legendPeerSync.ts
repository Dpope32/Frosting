import { useRegistryStore } from '@/store/RegistryStore';
import { observable } from '@legendapp/state';

const kaibaState$ = observable({
    stores: {
        registry: useRegistryStore,
    }
});





