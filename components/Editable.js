'use client';
import { useApp } from './Providers';

export default function Editable({ as: Tag = 'p', k, def }) {
  const { content, contentReady, isOwner, editing, saveContent, notify } = useApp();
  const text = content[k] ?? def;
  const canEdit = isOwner && editing;

  async function onBlur(e) {
    const el = e.currentTarget;
    const value = el.innerText.trim();
    if (!value) { el.innerText = text; return; }
    if (value === text) return;
    const err = await saveContent(k, value);
    notify(err ? 'Could not save: ' + err : 'Saved for everyone');
  }

  return (
    <Tag
      key={`${k}-${text}`}
      className={canEdit ? 'editable' : undefined}
      contentEditable={canEdit}
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={canEdit ? onBlur : undefined}
      onKeyDown={canEdit ? (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } } : undefined}
      style={{ visibility: contentReady ? 'visible' : 'hidden' }}
    >
      {text}
    </Tag>
  );
}
