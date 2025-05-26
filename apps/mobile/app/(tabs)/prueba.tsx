import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

// Inputs
import TextInputField from '../../components/ui/input/TextInputField';
import PasswordInput from '../../components/ui/input/PasswordInput';
import SelectDropdown from '../../components/ui/input/SelectDropdown';
import DateInput from '../../components/ui/input/DateInput';
import RUTInput from '../../components/ui/input/RUTInput';
import PhoneInput from '../../components/ui/input/phoneInput';
import EmailInput from '../../components/ui/input/EmailInput';
import CodeInput from '../../components/ui/input/CodeInput';

// Buttons
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import SecondaryButton from '../../components/ui/buttons/SecondaryButton';
import IconButton from '../../components/ui/buttons/IconButton';
import RoundedIconButton from '../../components/ui/buttons/IconButtonSimple';
import TextLinkButton from '../../components/ui/buttons/TextLinkButton';

// Cards
import UserCard from '../../components/ui/cards/UserCard';
import StudentCard from '../../components/ui/cards/StudentCard';
import HistoryCard from '../../components/ui/cards/HistoryCard';
import NotificationCard from '../../components/ui/cards/NotificationCard';
import ProfileCard from '../../components/ui/cards/ProfileCard';

// Modals
import ConfirmModal from '../../components/ui/alerts/ConfirmModal';
import FormModal from '../../components/ui/alerts/FormModal';
import AlertModal from '../../components/ui/alerts/AlertModal';

export default function ComponentesDemo() {
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [selected, setSelected] = useState('Opción 1');
  const [rut, setRut] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [date, setDate] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showForm, setShowForm] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Demo UI Componentes</Text>

      <TextInputField label="Campo de Texto" value={text} onChangeText={setText} />
      <PasswordInput label="Contraseña" value={password} onChangeText={setPassword} />
      <SelectDropdown
        label="Selector"
        selectedValue={selected}
        onValueChange={setSelected}
        options={["Opción 1", "Opción 2", "Opción 3"]}
      />
      <DateInput label="Fecha de Nacimiento" value={date} onChangeText={setDate} />
      <RUTInput label="RUT" value={rut} onChangeText={setRut} />
      <PhoneInput label="Teléfono" value={phone} onChangeText={setPhone} />
      <EmailInput label="Correo Electrónico" value={email} onChangeText={setEmail} />
      <CodeInput label="Código MFA" code={code} onChange={setCode} />

      <PrimaryButton title="Botón Principal" onPress={() => setShowConfirm(true)} />
      <SecondaryButton title="Botón Secundario" onPress={() => setShowAlert(true)} />
      <IconButton icon="create-outline" onPress={() => {}} />
      <RoundedIconButton icon="eye-outline" onPress={() => {}} />
      <TextLinkButton title="¿Olvidaste tu contraseña?" onPress={() => setShowForm(true)} />

      <UserCard name="Jane Doe" role="Delegado" onEdit={() => {}} onDelete={() => {}} />
      <StudentCard name="Camilo Rubilar" rut="20.555.555-5" grade="3° Medio" birthdate="28/08/2007" teacher="Nicolás A." />
      <HistoryCard date="24/04/2025" time="10:35" student="Camilo Rubilar" validator="Inspector Olivares" method="QR" />
      <NotificationCard icon="notifications-outline" message="Retiro confirmado" date="24/04/2025 10:35" />
      <ProfileCard name="Jane Doe" rut="20522384-7" phone="+569 7589 9865" email="jane.doe@email.com" />

      <ConfirmModal
        visible={showConfirm}
        message="¿Deseas confirmar esta acción?"
        onConfirm={() => setShowConfirm(false)}
        onCancel={() => setShowConfirm(false)}
      />
      <AlertModal
        visible={showAlert}
        title="Alerta"
        message="Esto es una alerta de ejemplo."
        onClose={() => setShowAlert(false)}
      />
      <FormModal
        visible={showForm}
        title="Formulario"
        footer={<PrimaryButton title="Cerrar" onPress={() => setShowForm(false)} />}
      >
        <TextInputField label="Nombre" value={text} onChangeText={setText} />
      </FormModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});