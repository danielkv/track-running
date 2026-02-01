import clsx from "clsx";
import {
  PressableProps as NativePressableProps,
  Pressable,
  Text,
} from "react-native";

interface ButtonProps extends NativePressableProps {
  className?: string;
}

export const Button = ({ className, children, ...props }: ButtonProps) => {
  return (
    <Pressable
      className={clsx(
        "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-center",
        className,
      )}
      {...props}
    >
      {typeof children === "string" ? <Text>{children}</Text> : children}
    </Pressable>
  );
};
