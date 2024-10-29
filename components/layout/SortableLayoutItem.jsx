import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import LayoutItem from "./LayoutItem";

export default function SortableLayoutItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <LayoutItem ref={setNodeRef} style={style} {...attributes} id={props.id} name={props.name} visible={props.visible} toggleVisibility={() => alert('hey')} {...listeners}>
    </LayoutItem>
  );
}