import React from 'react';
import { FlatList } from 'react-native';

export type RenderItemParams<T> = {
  item: T;
  drag: () => void;
  isActive: boolean;
  getIndex: () => number | undefined;
};

function DraggableFlatList<T>({
  data,
  renderItem,
  keyExtractor,
  onDragEnd: _onDragEnd,
  ...rest
}: {
  data: T[];
  renderItem: (params: RenderItemParams<T>) => React.ReactNode;
  keyExtractor: (item: T) => string;
  onDragEnd?: (params: { data: T[] }) => void;
  [key: string]: unknown;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) =>
        renderItem({
          item,
          drag: () => {},
          isActive: false,
          getIndex: () => index,
        }) as React.ReactElement
      }
      {...(rest as object)}
    />
  );
}

export function ScaleDecorator({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default DraggableFlatList;
