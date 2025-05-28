import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

interface PasswordInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
    value: string;
    onChangeText: (text: string) => void;
    className?: string; 
}

const PasswordInput: React.FC<PasswordInputProps> = ({
    value,
    onChangeText,
    className,
    placeholder,
    ...rest
}) => {
    return (
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            className={className}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            {...rest}
        />
    );
};

export default PasswordInput;
