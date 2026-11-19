'use client';

import { useMemo, useState } from 'react';
import {
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Users,
  Video,
} from 'lucide-react';
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  buildOutlookCalendarUrl,
  type EventFormat,
  type RsvpStatus,
} from '@community/calendar';
import { contentFromCatalog, pickContent } from '@community/identity';
import {
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Textarea,
  toast,
} from '@community/ui';
import {
  AppAlertDialog,
  AppDialog,
  AppDialogBody,
  AppDialogFooter,
  AppDialogHeader,
  AppPageTemplate,
} from '@community/ui-member';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';
import type { CalendarEventItem } from '@/lib/server/calendar-events';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  kicker: 'calendar.kicker',
  title: 'calendar.title',
  subtitle: 'calendar.subtitle',
  newEvent: 'calendar.new_event',
  editEvent: 'calendar.edit_event',
  today: 'calendar.today',
  upcoming: 'calendar.upcoming',
  past: 'calendar.past',
  empty: 'calendar.empty',
  dayEmpty: 'calendar.day_empty',
  clearDay: 'calendar.clear_day',
  fieldTitle: 'calendar.field_title',
  fieldTitlePh: 'calendar.field_title_ph',
  fieldDescription: 'calendar.field_description',
  fieldDescriptionPh: 'calendar.field_description_ph',
  fieldStarts: 'calendar.field_starts',
  fieldEnds: 'calendar.field_ends',
  fieldFormat: 'calendar.field_format',
  formatOnline: 'calendar.format_online',
  formatInPerson: 'calendar.format_in_person',
  formatHybrid: 'calendar.format_hybrid',
  fieldLocation: 'calendar.field_location',
  fieldLocationPh: 'calendar.field_location_ph',
  fieldMeetingUrl: 'calendar.field_meeting_url',
  save: 'calendar.save',
  saving: 'calendar.saving',
  cancel: 'calendar.cancel',
  edit: 'calendar.edit',
  remove: 'calendar.delete',
  deleteConfirm: 'calendar.delete_confirm',
  saved: 'calendar.saved',
  deleted: 'calendar.deleted',
  errorSave: 'calendar.error_save',
  errorTitle: 'calendar.error_title',
  errorStarts: 'calendar.error_starts',
  errorEnds: 'calendar.error_ends',
  errorUrl: 'calendar.error_url',
  rsvpGoing: 'calendar.rsvp_going',
  rsvpInterested: 'calendar.rsvp_interested',
  goingCount: 'calendar.going_count',
  interestedCount: 'calendar.interested_count',
  by: 'calendar.by',
  addToCalendar: 'calendar.add_to_calendar',
  addGoogle: 'calendar.add_google',
  addOutlook: 'calendar.add_outlook',
  addIcs: 'calendar.add_ics',
  openLink: 'calendar.open_link',
});

function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultStartLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(19, 0, 0, 0);
  return toLocalInputValue(d.toISOString());
}

export function CalendarPanel({ initialEvents }: { initialEvents: CalendarEventItem[] }) {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const intlLocale = locale === 'en' ? 'en-US' : 'pt-BR';

  const [events, setEvents] = useState<CalendarEventItem[]>(initialEvents);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState(defaultStartLocal);
  const [endsAt, setEndsAt] = useState('');
  const [format, setFormat] = useState<EventFormat>('online');
  const [location, setLocation] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CalendarEventItem | null>(null);
  const [rsvpPending, setRsvpPending] = useState<string | null>(null);

  async function reloadEvents() {
    const res = await fetch('/api/calendar/events');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        setEvents(json.data);
      }
    }
  }

  function openCreate(day?: string | null) {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setStartsAt(day ? `${day}T19:00` : defaultStartLocal());
    setEndsAt('');
    setFormat('online');
    setLocation('');
    setMeetingUrl('');
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(item: CalendarEventItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setStartsAt(toLocalInputValue(item.startsAt));
    setEndsAt(item.endsAt ? toLocalInputValue(item.endsAt) : '');
    setFormat(item.format);
    setLocation(item.location);
    setMeetingUrl(item.meetingUrl ?? '');
    setFormError(null);
    setDialogOpen(true);
  }

  function errorLabel(code: string): string {
    switch (code) {
      case 'title_required':
        return copy.errorTitle;
      case 'starts_at_invalid':
        return copy.errorStarts;
      case 'ends_at_before_start':
        return copy.errorEnds;
      case 'meeting_url_invalid':
        return copy.errorUrl;
      default:
        return copy.errorSave;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!title.trim()) {
      setFormError(copy.errorTitle);
      return;
    }
    const startDate = new Date(startsAt);
    if (!startsAt || Number.isNaN(startDate.getTime())) {
      setFormError(copy.errorStarts);
      return;
    }
    let endIso: string | null = null;
    if (endsAt.trim()) {
      const endDate = new Date(endsAt);
      if (Number.isNaN(endDate.getTime()) || endDate.getTime() < startDate.getTime()) {
        setFormError(copy.errorEnds);
        return;
      }
      endIso = endDate.toISOString();
    }

    setSaving(true);
    try {
      const endpoint = editingId ? `/api/calendar/events/${editingId}` : '/api/calendar/events';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          startsAt: startDate.toISOString(),
          endsAt: endIso,
          format,
          location,
          meetingUrl: meetingUrl.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = errorLabel(data?.error?.message || '');
        setFormError(msg);
        toast.error(msg);
        return;
      }
      await reloadEvents();
      setDialogOpen(false);
      toast.success(copy.saved);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: CalendarEventItem) {
    const res = await fetch(`/api/calendar/events/${item.id}`, { method: 'DELETE' });
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== item.id));
      toast.success(copy.deleted);
    } else {
      toast.error(copy.errorSave);
    }
    setDeleteTarget(null);
  }

  async function handleRsvp(item: CalendarEventItem, target: RsvpStatus) {
    const next: RsvpStatus | null = item.myRsvp === target ? null : target;
    setRsvpPending(item.id);
    try {
      const res = await fetch(`/api/calendar/events/${item.id}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        toast.error(copy.errorSave);
        return;
      }
      setEvents((prev) =>
        prev.map((ev) => {
          if (ev.id !== item.id) return ev;
          let going = ev.goingCount;
          let interested = ev.interestedCount;
          if (ev.myRsvp === 'going') going = Math.max(0, going - 1);
          if (ev.myRsvp === 'interested') interested = Math.max(0, interested - 1);
          if (next === 'going') going += 1;
          if (next === 'interested') interested += 1;
          return { ...ev, myRsvp: next, goingCount: going, interestedCount: interested };
        })
      );
    } finally {
      setRsvpPending(null);
    }
  }

  function downloadIcs(item: CalendarEventItem) {
    const ics = buildIcsContent(item);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.toLowerCase().replace(/[^a-z0-9]+/gi, '-') || 'evento'}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>();
    for (const ev of events) {
      const key = dayKey(new Date(ev.startsAt));
      const list = map.get(key) || [];
      list.push(ev);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const calendarCells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date | null; key: string }> = [];
    for (let i = 0; i < startWeekday; i += 1) {
      cells.push({ date: null, key: `empty-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(year, month, d);
      cells.push({ date, key: dayKey(date) });
    }
    return cells;
  }, [cursor]);

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(intlLocale, { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2026, 10, 1 + i)));
  }, [intlLocale]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocale, { month: 'long', year: 'numeric' }).format(cursor),
    [cursor, intlLocale]
  );

  const todayKey = dayKey(new Date());
  const nowMs = Date.now();

  const visibleEvents = useMemo(() => {
    if (selectedDay) {
      return eventsByDay.get(selectedDay) || [];
    }
    return events;
  }, [events, eventsByDay, selectedDay]);

  const upcomingEvents = useMemo(
    () => visibleEvents.filter((ev) => Date.parse(ev.endsAt || ev.startsAt) >= nowMs - 60 * 60 * 1000),
    [visibleEvents, nowMs]
  );
  const pastEvents = useMemo(
    () => visibleEvents.filter((ev) => Date.parse(ev.endsAt || ev.startsAt) < nowMs - 60 * 60 * 1000).reverse(),
    [visibleEvents, nowMs]
  );

  const formatLabel = (fmt: EventFormat) => {
    if (fmt === 'in_person') return copy.formatInPerson;
    if (fmt === 'hybrid') return copy.formatHybrid;
    return copy.formatOnline;
  };

  const renderEventCard = (item: CalendarEventItem) => {
    const start = new Date(item.startsAt);
    const end = item.endsAt ? new Date(item.endsAt) : null;
    const dayNum = start.getDate();
    const monthShort = new Intl.DateTimeFormat(intlLocale, { month: 'short' }).format(start).replace('.', '');
    const timeFmt = new Intl.DateTimeFormat(intlLocale, { hour: '2-digit', minute: '2-digit' });
    const timeRange = end ? `${timeFmt.format(start)} – ${timeFmt.format(end)}` : timeFmt.format(start);

    return (
      <Card key={item.id} className="overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex shrink-0 flex-row items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2 text-center sm:w-16 sm:flex-col sm:gap-0">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {monthShort}
              </span>
              <span className="text-xl font-bold tabular-nums leading-tight">{dayNum}</span>
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold leading-snug">{item.title}</h3>
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {formatLabel(item.format)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {timeRange}
                    </span>
                    {item.location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {item.location}
                      </span>
                    ) : null}
                    {item.creatorName ? (
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" />
                        {copy.by} {item.creatorName}
                      </span>
                    ) : null}
                  </div>
                </div>

                {item.canEdit ? (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={copy.edit}
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={copy.remove}
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                ) : null}
              </div>

              {item.description ? (
                <p className="whitespace-pre-line text-sm text-muted-foreground">{item.description}</p>
              ) : null}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant={item.myRsvp === 'going' ? 'default' : 'outline'}
                  disabled={rsvpPending === item.id}
                  onClick={() => void handleRsvp(item, 'going')}
                >
                  {copy.rsvpGoing} ({item.goingCount})
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={item.myRsvp === 'interested' ? 'secondary' : 'outline'}
                  disabled={rsvpPending === item.id}
                  onClick={() => void handleRsvp(item, 'interested')}
                >
                  {copy.rsvpInterested} ({item.interestedCount})
                </Button>
                {item.meetingUrl ? (
                  <Button type="button" size="sm" variant="outline" asChild>
                    <a href={item.meetingUrl} target="_blank" rel="noopener noreferrer">
                      <Video className="size-3.5" />
                      {copy.openLink}
                      <ExternalLink className="size-3" />
                    </a>
                  </Button>
                ) : null}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" size="sm" variant="ghost">
                      <CalendarPlus className="size-3.5" />
                      {copy.addToCalendar}
                      <ChevronDown className="size-3.5 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem asChild>
                      <a
                        href={buildGoogleCalendarUrl(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-3.5" />
                        {copy.addGoogle}
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={buildOutlookCalendarUrl(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-3.5" />
                        {copy.addOutlook}
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => downloadIcs(item)}>
                      <Download className="size-3.5" />
                      {copy.addIcs}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppPageTemplate
      kicker={copy.kicker}
      title={copy.title}
      subtitle={copy.subtitle}
      actions={
        <Button type="button" onClick={() => openCreate(selectedDay)}>
          <Plus className="size-4" />
          {copy.newEvent}
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
        <Card className="lg:sticky lg:top-6">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold capitalize">{monthLabel}</h2>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => {
                    const now = new Date();
                    setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
                    setSelectedDay(null);
                  }}
                >
                  {copy.today}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
              {weekdays.map((day, idx) => (
                <div key={idx} className="py-1 uppercase">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell) => {
                if (!cell.date) {
                  return <div key={cell.key} className="h-9" />;
                }
                const hasEvents = eventsByDay.has(cell.key);
                const isToday = cell.key === todayKey;
                const isSelected = cell.key === selectedDay;
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelectedDay(isSelected ? null : cell.key)}
                    className={`relative flex h-9 flex-col items-center justify-center rounded-md text-xs transition-colors ${
                      isSelected
                        ? 'bg-primary font-semibold text-primary-foreground'
                        : isToday
                          ? 'border border-primary font-semibold text-foreground hover:bg-muted'
                          : 'hover:bg-muted'
                    }`}
                  >
                    <span>{cell.date.getDate()}</span>
                    {hasEvents ? (
                      <span
                        className={`mt-0.5 size-1 rounded-full ${
                          isSelected ? 'bg-primary-foreground' : 'bg-primary'
                        }`}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {selectedDay ? (
              <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs">
                <span className="font-medium text-muted-foreground">{selectedDay}</span>
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelectedDay(null)}>
                  {copy.clearDay}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {copy.upcoming}
            </h2>
            {upcomingEvents.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <CalendarPlus className="size-8 text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground">
                    {selectedDay ? copy.dayEmpty : copy.empty}
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => openCreate(selectedDay)}>
                    <Plus className="size-4" />
                    {copy.newEvent}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">{upcomingEvents.map(renderEventCard)}</div>
            )}
          </section>

          {pastEvents.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {copy.past}
              </h2>
              <div className="space-y-3 opacity-80">{pastEvents.map(renderEventCard)}</div>
            </section>
          ) : null}
        </div>
      </div>

      <AppDialog open={dialogOpen} onClose={() => setDialogOpen(false)} size="md">
        <AppDialogHeader title={editingId ? copy.editEvent : copy.newEvent} />
        <AppDialogBody>
          <form id="calendar-event-form" onSubmit={handleSubmit} className="space-y-4">
            {formError ? (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {formError}
              </p>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="cal-title">{copy.fieldTitle}</Label>
              <Input
                id="cal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={copy.fieldTitlePh}
                maxLength={120}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cal-starts">{copy.fieldStarts}</Label>
                <Input
                  id="cal-starts"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cal-ends">{copy.fieldEnds}</Label>
                <Input
                  id="cal-ends"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{copy.fieldFormat}</Label>
              <div className="flex flex-wrap gap-2">
                {(['online', 'in_person', 'hybrid'] as EventFormat[]).map((opt) => (
                  <Button
                    key={opt}
                    type="button"
                    size="sm"
                    variant={format === opt ? 'default' : 'outline'}
                    onClick={() => setFormat(opt)}
                  >
                    {formatLabel(opt)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cal-location">{copy.fieldLocation}</Label>
                <Input
                  id="cal-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={copy.fieldLocationPh}
                  maxLength={200}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cal-url">{copy.fieldMeetingUrl}</Label>
                <Input
                  id="cal-url"
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cal-desc">{copy.fieldDescription}</Label>
              <Textarea
                id="cal-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={copy.fieldDescriptionPh}
                maxLength={2000}
              />
            </div>
          </form>
        </AppDialogBody>
        <AppDialogFooter>
          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
            {copy.cancel}
          </Button>
          <Button type="submit" form="calendar-event-form" disabled={saving}>
            {saving ? copy.saving : copy.save}
          </Button>
        </AppDialogFooter>
      </AppDialog>

      <AppAlertDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={copy.deleteConfirm}
        description={deleteTarget?.title || ''}
        confirmLabel={copy.remove}
        cancelLabel={copy.cancel}
        confirmVariant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            void handleDelete(deleteTarget);
          }
        }}
      />
    </AppPageTemplate>
  );
}
