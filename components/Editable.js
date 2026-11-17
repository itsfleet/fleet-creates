'use client';
import { useApp } from './Providers';
export default function Editable({ k, def, as: Tag = 'span' }) {
  const { content, canEdit, editing, save } = useApp();
  const val = content[k] ?? def;
  if (!(canEdit && editing)) return <Tag>{val}</Tag>;
  return (
    <Tag className="editable" contentEditable suppressContentEditableWarning
      onBlur={(e) => { const v = e.currentTarget.innerText.trim(); if (v && v !== val) save(k, v); }}>
      {val}
    </Tag>
  );
}
