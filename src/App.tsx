import type Konva from 'konva';
import React, { useState } from 'react';
import { Stage, Layer, Group, Rect, Text } from 'react-konva';

interface CalendarEvent {
  date: string; // YYYY-MM-DD
  title: string;
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

function formatDate(date: Date) {
  // currently YYYY-MM-DD
  return date.toISOString().split('T')[0];
}


const App: React.FC = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const STICKER_CHOICES = ['🌟', '📌', '🎂', '🐱', '✅'];
  const [selectedSticker, setSelectedSticker] = useState<string>('🌟');
  const [stickers, setStickers] = useState<Sticker[]>([]);

  const days = getDaysInMonth(year, month);
  const startOffset = new Date(year, month, 1).getDay(); // Sunday = 0

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');


  const handleDayClick = (date: string) => {
    setEditingDate(date);
    setNoteInput(notes[date] || '');
  };
  
  const handleCanvasClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const newSticker: Sticker = {
      id: Math.random().toString(36).substring(2),
      emoji: selectedSticker,
      x: pos.x,
      y: pos.y,
      // date: '', // optional: could still map to a date using x/y
    };

    setStickers([...stickers, newSticker]);
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
                onClick={() => handleDayClick(dateKey)}
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
        {STICKER_CHOICES.map((emoji) => (
          <button
            key={emoji}
            style={{
              fontSize: '1.5rem',
              margin: '0 0.5rem',
              background: emoji === selectedSticker ? '#ddd' : 'white',
              borderRadius: '0.5rem',
              padding: '0.25rem 0.5rem',
              border: '1px solid #ccc',
              cursor: 'pointer',
            }}
            onClick={() => setSelectedSticker(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
      {editingDate && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <h3>Note for {editingDate}</h3>
          <textarea
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            rows={3}
            cols={40}
          />
          <br />
          <button
            onClick={() => {
              setNotes({ ...notes, [editingDate]: noteInput });
              setEditingDate(null);
              setNoteInput('');
            }}
            style={{ marginTop: '0.5rem' }}
          >
            Save Note
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
