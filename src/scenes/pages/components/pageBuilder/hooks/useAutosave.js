import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../../../utils/axios.config';
import { debounce } from 'lodash';

const AUTOSAVE_INTERVAL = 30000; // 30 seconds

export default function useAutosave({ editor, pageId, language, enabled }) {
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');

  const saveTemplate = useCallback(async () => {
    if (!editor || !enabled) return;

    try {
      setSaveStatus('saving');
      const templateData = {
        html: editor.getHtml(),
        css: editor.getCss(),
        js: editor.getJs(),
        lastModified: new Date(),
      };

      await axiosInstance.put(`/pages/autosave/${pageId}`, {
        template: templateData,
        language,
      });

      setLastSaved(new Date());
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
      console.error('Autosave failed:', error);
    }
  }, [editor, pageId, language, enabled]);

  const debouncedSave = useCallback(
    debounce(async () => {
      if (!editor?.getHtml()?.trim()) return;
      await saveTemplate();
    }, 2000),
    [editor, saveTemplate]
  );

  useEffect(() => {
    if (!editor || !enabled) return;
    
    editor.on('component:update', debouncedSave);
    editor.on('style:update', debouncedSave);
    
    return () => {
      editor.off('component:update', debouncedSave);
      editor.off('style:update', debouncedSave);
      debouncedSave.cancel();
    };
  }, [editor, enabled, debouncedSave]);

  return { lastSaved, saveStatus, saveTemplate };
}
 