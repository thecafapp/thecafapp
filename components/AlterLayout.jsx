import React, { useEffect, useState } from 'react';
import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import SortableLayoutItem from './layout/SortableLayoutItem';
import LayoutItem from './layout/LayoutItem';

export default function AlterLayout() {
    const [activeItem, setActiveItem] = useState(null);
    const [items, setItems] = useState(JSON.parse(window.localStorage.getItem("layout")));
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    function handleDragStart(event) {
        const { active } = event;

        setActiveItem(items.find((i) => i.id == active.id));
    }

    function handleDragEnd(event) {
        const { active, over } = event;

        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((i) => active.id === i.id);
                const newIndex = items.findIndex((i) => over.id === i.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveItem(null);
    }

    useEffect(() => {
        window.localStorage.setItem("layout", JSON.stringify(items));
    }, [items])

    return (
        <div className="alter-layout">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items}
                    strategy={verticalListSortingStrategy}
                >
                    {items.map(item => <SortableLayoutItem key={item.id} id={item.id} name={item.name} />)}
                </SortableContext>
                <DragOverlay>
                    {activeItem ? <LayoutItem id={activeItem.id} name={activeItem.name} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );

}