import type { MutableRefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { useSelector } from 'react-redux';
import type { PickAnimated, SpringValues } from 'react-spring';
import { useSpring } from 'react-spring';
import type { Row } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { selectCurrentPosition, setPosition } from '@editor/store/slices/drag';
import type { FieldType } from '@ff-client/types/fields';

type RowDragHook = {
  dropRef: MutableRefObject<HTMLDivElement>;
  placeholderStyle: SpringValues<
    PickAnimated<{ flexGrow: number; transform: string }>
  >;
  isOver: boolean;
};

export const useCellDrop = (row: Row, cellCount: number): RowDragHook => {
  const dispatch = useAppDispatch();
  const placeholderPosition = useSelector(selectCurrentPosition);

  const dropRef = useRef<HTMLDivElement>(null);
  const activeSectorRef = useRef<number>(placeholderPosition);
  const sectorWidthRef = useRef<number>(0);

  const [width, setWidth] = useState(0);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    const dimensions = dropRef.current.getBoundingClientRect();

    setWidth(dimensions.width);
    setLeft(dimensions.left);

    // TODO: implement resize updates
  }, [cellCount]);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ['BaseField', 'LayoutField'],
      canDrop: (_, monitor) => monitor.isOver({ shallow: true }),
      drop: (item: FieldType): void => {
        console.log('Row:', row.uid);
        console.log('Cell:', activeSectorRef.current, item.type);
      },
      hover: (item, monitor): void => {
        const sectorWidth = width / (cellCount + 1);
        if (sectorWidthRef.current !== sectorWidth) {
          sectorWidthRef.current = sectorWidth;
          console.log(sectorWidth);
        }

        const offset = monitor.getClientOffset().x - left;

        const mouseInSector = Math.floor(offset / sectorWidth);

        if (activeSectorRef.current !== mouseInSector) {
          activeSectorRef.current = mouseInSector;
          dispatch(setPosition(mouseInSector));
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [left, width]
  );

  drop(dropRef);

  const placeholderStyle = useSpring({
    to: {
      background: 'grey',
      flexGrow: isOver ? 1 : 1,
      transform: `translateX(${
        sectorWidthRef.current * placeholderPosition
      }px)`,
    },
  });

  return {
    dropRef,
    placeholderStyle,
    isOver,
  };
};