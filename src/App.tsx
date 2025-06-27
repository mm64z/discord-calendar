import type Konva from 'konva';
import React, { useState } from 'react';
import { Stage, Layer, Group, Rect, Text } from 'react-konva';
import { BACKGROUND_COLOR, SELECTED_COLOR, STICKER_CHOICES } from './const';

interface NoteMap {
  [date: string]: string;       // YYYY‑MM‑DD → note text
}

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

const CELL_WIDTH = 100;
const CELL_HEIGHT = 100;
const NUM_COLS = 7;

const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

function dateKey(date: Date) {
  // currently YYYY-MM-DD
  return date.toISOString().split('T')[0];
}


const App: React.FC = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();


  const [mode, setMode] = useState<'sticker' | 'select'>('sticker');
  const [selectedSticker, setSelSticker] = useState<string | null>(STICKER_CHOICES[0].emoji);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [notes, setNotes] = useState<NoteMap>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const days = getDaysInMonth(year, month);
  const startOffset = new Date(year, month, 1).getDay(); // Sun=0

  const handleCanvasClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos  = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    if (mode === 'sticker' && selectedSticker) {
      // place sticker exactly where clicked
      setStickers(prev => [
        ...prev,
        {
          id   : Math.random().toString(36).slice(2),
          emoji: selectedSticker,
          x    : pos.x - 15,
          y    : pos.y - 8,
          // date : mapPosToDate(pos.x, pos.y),
        },
      ]);
      return;
    }

    // SELECT mode – open note editor for the clicked day (if in bounds)
    const dKey = mapPosToDate(pos.x, pos.y);
    if (dKey) {
      setEditing(dKey);
      setNoteInput(notes[dKey] || '');
    }
  };
  
  const mapPosToDate = (x: number, y: number): string | null => {
    const col = Math.floor(x / CELL_WIDTH);
    const row = Math.floor(y / CELL_HEIGHT);
    const dayIdx = row * NUM_COLS + col - startOffset;
    if (dayIdx < 0 || dayIdx >= days.length) return null;
    return dateKey(days[dayIdx]);
  };  
  
  const saveNote = () => {
    if (!editing) return;
    setNotes({ ...notes, [editing]: noteInput });
    setEditing(null);
    setNoteInput('');
  };

  const handleDragMove = (id: string, pos: { x: number; y: number }) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...pos } : s))
    );
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>📅 React Konva Calendar</h1>
      <Stage
        width={CELL_WIDTH * NUM_COLS}
        height={CELL_HEIGHT * 6} // enough for most months
      >
        <Layer
          onClick={handleCanvasClick}>
          {days.map((day, index) => {
            const row = Math.floor((index + startOffset) / NUM_COLS);
            const col = (index + startOffset) % NUM_COLS;
            const x = col * CELL_WIDTH;
            const y = row * CELL_HEIGHT;
            const dateKey = day.toISOString().split('T')[0];

            return (
              <Group
                key={dateKey}
              >
                <Rect
                  x={x}
                  y={y}
                  width={CELL_WIDTH}
                  height={CELL_HEIGHT}
                  stroke="#999"
                  cornerRadius={8}
                />
                <Text
                  x={x + 5}
                  y={y + 5}
                  text={day.getDate().toString()}
                  fontSize={16}
                  fill="#333"
                />
                {notes[dateKey] && (
                  <Text
                    x={x + 5}
                    y={y + 25}
                    width={CELL_WIDTH - 10}
                    text={notes[dateKey]}
                    fontSize={12}
                    fill="#555"
                    lineHeight={1.2}
                  />
                )}
              </Group>
            );
          })}

          {stickers.map((s) => (
            <Text
              key={s.id}
              text={s.emoji}
              x={s.x}
              y={s.y}
              fontSize={24}
              draggable
              onDragEnd={(e) =>
                handleDragMove(s.id, {
                  x: e.target.x(),
                  y: e.target.y(),
                })
              }
            />
          ))}
        </Layer>
      </Stage>
      <div style={{ margin: '1rem', textAlign: 'center' }}>
        <button
          onClick={() => {setMode('select');setSelSticker(null)}}
          style={{
            fontSize: '1.6rem',
            margin: '0 0.4rem',
            padding: '0.2rem 0.4rem',
            borderRadius: '8px',
            border: '1px solid #aaa',
            background: mode === 'select' ? SELECTED_COLOR : BACKGROUND_COLOR,
            cursor: 'pointer',
          }}
        >
          📝 Select mode
        </button>
        {STICKER_CHOICES.map(({ emoji }) => (
          <button
            key={emoji}
            onClick={() => {setSelSticker(emoji);setMode('sticker')}}
            style={{
              fontSize: '1.6rem',
              margin: '0 0.4rem',
              padding: '0.2rem 0.4rem',
              borderRadius: '8px',
              border: '1px solid #aaa',
              background: emoji === selectedSticker ? SELECTED_COLOR : BACKGROUND_COLOR,
              cursor: 'pointer',
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
      {editing && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <h3>Note for {editing}</h3>
          <textarea
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            rows={3}
            cols={36}
          />
          <br />
          <button onClick={saveNote} style={{ marginTop: '0.5rem' }}>
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
