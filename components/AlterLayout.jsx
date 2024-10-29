import React, { useEffect, useState } from 'react';
import {
    closestCenter,
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import SortableLayoutItem from './layout/SortableLayoutItem';
import LayoutItem from './layout/LayoutItem';

export default function AlterLayout() {
    const [activeItem, setActiveItem] = useState(null);
    const [items, setItems] = useState(JSON.parse(window.localStorage.getItem("layout")));
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 150,
                tolerance: 2
            }
        }),
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

    const toggleVisibility = (id, visibility) => {
        console.log("visibility change", visibility)
        setItems((items) => {
            let arr = [...items]
            const i = arr.findIndex((item) => item.id === id);
            arr[i].visible = visibility;
            return arr;
        })
    }

    return (
        <div className="alter-layout" style={{ touchAction: "none" }}>
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
                    {items.map(item => <SortableLayoutItem key={item.id} id={item.id} name={item.name} visible={item.visible} toggleVisibility={toggleVisibility} />)}
                </SortableContext>
                <DragOverlay>
                    {activeItem ? <LayoutItem id={activeItem.id} name={activeItem.name} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );

}