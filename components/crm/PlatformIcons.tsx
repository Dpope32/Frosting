import { Paragraph, XStack } from "tamagui";

import { Mail, Phone, Wallet, CreditCard, DollarSign } from "@tamagui/lucide-icons";

export function PlatformIcons({ type, value }: { type: string; value: string }) {
  const getIcon = () => {
    switch(type.toLowerCase()) {
      case 'email': return <Mail size="$1" />;
      case 'phone': return <Phone size="$1" />;
      case 'cashapp': return <DollarSign size="$1" />;
      case 'venmo': return <Wallet size="$1" />;
      case 'paypal': return <CreditCard size="$1" />;
      default: return null;
    }
  };

  return (
    <XStack ai="center" gap="$1" bg="$backgroundHover" p="$2" br="$2">
      {getIcon()}
      <Paragraph fontSize="$1">{value}</Paragraph>
    </XStack>
  );
}
