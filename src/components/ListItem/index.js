import React, {useCallback, useContext, useRef, useState} from 'react';
import { useDrag, useDrop } from 'react-dnd';
import Button from 'antd/es/button';
import Tooltip from 'antd/es/tooltip';

import { ITEM_TYPE } from '../List';
import { PaneContext } from 'components/PaneContent';

import { ListItemWrapper, StyledListItem } from './styled';


const ListItem = ({ id, name: originalName, moveItem, index }) => {
    const { list, setList, storeItems } = useContext(PaneContext);
    const [itemName, setItemName] = useState(originalName);
    const [inEdit, setInEdit] = useState(false);
    const ref = useRef(null);

    const editListItem = useCallback((e) => {
        const value = e.target.value;
        setItemName(value);
    }, []);

    const deleteListItem = useCallback(() => {
        const newList = list.filter((nItem, nIndex)=>nIndex !== index);
        setList(newList);
    }, [list]);

    const onDoubleClick = useCallback((e) => {
       if(!inEdit) {
           e.target.select();
           ref.current.focus();
            setInEdit(true);
        }
    }, [inEdit, ref]);

    const onBlur = useCallback((e) => {
        if (inEdit) {
            const value = e.target.value;
            const newList = [...list];

            newList[index] = {...newList[index], name: value};
            setList(newList);
            setInEdit(false);
        }
    }, [inEdit, list]);

    const [, drop] = useDrop({
        accept: ITEM_TYPE,
        hover(item, monitor) {
            if (!ref.current){
                return;
            }

            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) {
                return;
            }

            const hoveredRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoveredRect.bottom - hoveredRect.top) / 2
            const mousePosition = monitor.getClientOffset();
            const hoverClientY = mousePosition.y - hoveredRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }//
            moveItem(dragIndex, hoverIndex);
            item.index = hoverIndex;
            // if (dragIndex > hoverIndex && hoverClientY < )
        }
    });
    const [{ isDragging }, drag] = useDrag({
        item: { type: ITEM_TYPE, id, index },
        collect: monitor => ({
            isDragging: monitor.isDragging()
        })
    });
    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));

    return  (
        <ListItemWrapper>
            <div onDoubleClick={onDoubleClick}>
                <StyledListItem ref={ref} opacity={opacity} autoFocus={inEdit} disabled={!inEdit} onBlur={onBlur} onChange={editListItem} type='text' value={itemName}/>
            </div>
            <Tooltip title='Delete item'>
                <Button style={{opacity}} type='danger' shape='circle' onClick={deleteListItem} > X </Button>
             </Tooltip>
        </ListItemWrapper>
    )
};

export default ListItem;
