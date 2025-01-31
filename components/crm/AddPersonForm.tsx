import { Button, Dialog, Fieldset, Input, Label, XStack, YStack } from "tamagui";
import { usePeopleStore } from "@/store/People";
import { useState } from "react";
import { PlatformIcons } from "@/components/crm/PlatformIcons";
import type { Person } from "@/types/people";

export function AddPersonForm() {
  const { addPerson } = usePeopleStore();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Person>>({
    payments: [],
    socialMedia: [],
    address: { street: '', city: '', state: '', zipCode: '', country: '' }
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.address) return;
    
    addPerson({
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Ensure address is fully defined
      address: {
        street: formData.address.street || '',
        city: formData.address.city || '',
        state: formData.address.state || '',
        zipCode: formData.address.zipCode || '',
        country: formData.address.country || ''
      }
    } as Person);
    
    setOpen(false);
    setFormData({
      payments: [],
      socialMedia: [],
      address: { street: '', city: '', state: '', zipCode: '', country: '' }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button theme="alt2" mt="$4">Add New Person</Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Add New Contact</Dialog.Title>
          
          <YStack gap="$3">
            <Fieldset>
              <Label>Full Name</Label>
              <Input 
                value={formData.name || ''}
                onChangeText={text => setFormData(prev => ({...prev, name: text}))}
              />
            </Fieldset>

            <Fieldset>
              <Label>Nickname</Label>
              <Input 
                value={formData.nickname || ''}
                onChangeText={text => setFormData(prev => ({...prev, nickname: text}))}
              />
            </Fieldset>

            <Fieldset>
              <Label>Email</Label>
              <Input 
                keyboardType="email-address"
                value={formData.email || ''}
                onChangeText={text => setFormData(prev => ({...prev, email: text}))}
              />
            </Fieldset>

            <Fieldset>
              <Label>Phone Number</Label>
              <Input 
                keyboardType="phone-pad"
                value={formData.phoneNumber || ''}
                onChangeText={text => setFormData(prev => ({...prev, phoneNumber: text}))}
              />
            </Fieldset>

            <Fieldset>
              <Label>Address</Label>
              <Input 
                value={formData.address?.street || ''}
                onChangeText={text => setFormData(prev => ({
                  ...prev,
                  address: {
                    ...(prev.address || { city: '', state: '', zipCode: '', country: '' }),
                    street: text
                  }
                }))}
                placeholder="Street"
              />
              <Input 
                value={formData.address?.city || ''}
                onChangeText={text => setFormData(prev => ({
                  ...prev,
                  address: {
                    ...(prev.address || { street: '', state: '', zipCode: '', country: '' }),
                    city: text
                  }
                }))}
                placeholder="City"
              />
              <Input 
                value={formData.address?.state || ''}
                onChangeText={text => setFormData(prev => ({
                  ...prev,
                  address: {
                    ...(prev.address || { street: '', city: '', zipCode: '', country: '' }),
                    state: text
                  }
                }))}
                placeholder="State"
              />
              <Input 
                value={formData.address?.zipCode || ''}
                onChangeText={text => setFormData(prev => ({
                  ...prev,
                  address: {
                    ...(prev.address || { street: '', city: '', state: '', country: '' }),
                    zipCode: text
                  }
                }))}
                placeholder="Zip Code"
              />
              <Input 
                value={formData.address?.country || ''}
                onChangeText={text => setFormData(prev => ({
                  ...prev,
                  address: {
                    ...(prev.address || { street: '', city: '', state: '', zipCode: '' }),
                    country: text
                  }
                }))}
                placeholder="Country"
              />
            </Fieldset>

            <Fieldset>
              <Label>Birthday</Label>
              <Input 
                value={formData.birthday || ''}
                onChangeText={text => setFormData(prev => ({...prev, birthday: text}))}
                placeholder="YYYY-MM-DD"
              />
            </Fieldset>

            <Button onPress={handleSubmit}>Submit</Button>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}