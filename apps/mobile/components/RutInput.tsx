import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

interface RutInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
    value: string;
    onChangeText: (text: string) => void;
    className?: string; 
}

const RutInput: React.FC<RutInputProps> = ({
    value,
    onChangeText,
    placeholder,
    className,
    ...rest
}) => {
    return (
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            className={className}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            {...rest}
        />
    );
};

export default RutInput;