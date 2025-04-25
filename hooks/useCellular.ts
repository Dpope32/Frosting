import * as Cellular from 'expo-cellular';
import { useState, useEffect } from 'react';
import { CellularGeneration } from 'expo-cellular';

export const useCellular = () => {
  const [cellularInfo, setCellularInfo] = useState({
    carrier: null as string | null,
    countryCode: null as string | null,
    mobileCountryCode: null as string | null,
    mobileNetworkCode: null as string | null,
    allowsVoip: false,
    cellularGeneration: null as CellularGeneration | null,
    isLoading: true,
    error: null as string | null,
  });

  useEffect(() => {
    const getCellularInfo = async () => {
      try {
        setCellularInfo(prev => ({ ...prev, isLoading: true, error: null }));
        
        const [
          carrier,
          countryCode,
          mobileCountryCode,
          mobileNetworkCode,
          allowsVoip,
          cellularGeneration,
        ] = await Promise.all([
          Cellular.getCarrierNameAsync(),
          Cellular.getIsoCountryCodeAsync(),
          Cellular.getMobileCountryCodeAsync(),
          Cellular.getMobileNetworkCodeAsync(),
          Cellular.allowsVoipAsync(),
          Cellular.getCellularGenerationAsync(),
        ]);

        setCellularInfo({
          carrier,
          countryCode,
          mobileCountryCode,
          mobileNetworkCode,
          allowsVoip: allowsVoip ?? false,
          cellularGeneration,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching cellular info:', error);
        setCellularInfo(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch cellular info',
        }));
      }
    };

    getCellularInfo();
  }, []);

  return cellularInfo;
};
