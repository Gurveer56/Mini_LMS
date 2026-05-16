import { cn } from '@/lib/utils';
import { Feather } from '@expo/vector-icons';
import * as React from 'react';
import { Platform, TextInput, TouchableOpacity, View } from 'react-native';

const Input = React.forwardRef<
  TextInput,
  React.ComponentProps<typeof TextInput> & { secureTextEntry?: boolean }
>(({ className, secureTextEntry, ...props }, ref) => {
  const [isSecure, setIsSecure] = React.useState(secureTextEntry);

  if (secureTextEntry) {
    return (
      <View className="relative w-full">
        <TextInput
          ref={ref}
          secureTextEntry={isSecure}
          className={cn(
            'bg-inputBackground border-input text-foreground flex h-12 w-full min-w-0 flex-row items-center rounded-lg border px-3 py-2 pr-12 text-base leading-5',
            props.editable === false && 'opacity-50',
            Platform.select({
              native: 'placeholder:text-muted-foreground',
            }),
            className
          )}
          {...props}
        />
        <TouchableOpacity
          onPress={() => setIsSecure(!isSecure)}
          className="absolute right-3 top-3"
          activeOpacity={0.7}
        >
          <Feather
            name={isSecure ? 'eye-off' : 'eye'}
            size={20}
            color="#a1a1aa"
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TextInput
      ref={ref}
      className={cn(
        'bg-inputBackground border-input text-foreground flex h-12 w-full min-w-0 flex-row items-center rounded-lg border px-3 py-2 text-base leading-5',
        props.editable === false && 'opacity-50',
        Platform.select({
          native: 'placeholder:text-muted-foreground',
        }),
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
