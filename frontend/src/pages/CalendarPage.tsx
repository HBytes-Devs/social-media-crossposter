import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import {
  calendarEventDate,
  dateKey,
  endOfMonth,
  formatMonthLabel,
  startOfMonth,
} from "../lib/datetime";
import { platformLabel } from "../lib/platforms";
import type { CalendarPostItem } from "../types";
import { useAppSelector } from "../store/hooks";
import { selectToken } from "../store/slices/authSlice";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageStateLoader } from "../components/ui/PageState";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildMonthGrid(month: Date): Array<Date | null> {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const cells: Array<Date | null> = [];

  for (let i = 0; i < first.getDay(); i++) {
    cells.push(null);
  }

  for (let day = 1; day <= last.getDate(); day++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function CalendarPage() {
  const navigate = useNavigate();
  const token = useAppSelector(selectToken);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [posts, setPosts] = useState<CalendarPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(dateKey(new Date()));

  const range = useMemo(
    () => ({
      from: startOfMonth(month).toISOString(),
      to: endOfMonth(month).toISOString(),
    }),
    [month],
  );

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .getCalendarPosts(token, range.from, range.to)
      .then((data) => setPosts(data.posts))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [token, range.from, range.to]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, CalendarPostItem[]>();
    for (const post of posts) {
      const eventDate = calendarEventDate(post);
      if (!eventDate) continue;
      const key = dateKey(eventDate);
      const list = map.get(key) ?? [];
      list.push(post);
      map.set(key, list);
    }
    return map;
  }, [posts]);

  const selectedPosts = selectedDay ? (postsByDay.get(selectedDay) ?? []) : [];
  const cells = buildMonthGrid(month);

  function shiftMonth(delta: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        gap={1.5}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Calendar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Scheduled aur published posts — month view
          </Typography>
        </Box>
        <Button variant="secondary" onClick={() => navigate("/compose")}>
          + Schedule post
        </Button>
      </Stack>

      <Card padding="none" className="overflow-hidden">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}
        >
          <IconButton aria-label="Previous month" onClick={() => shiftMonth(-1)}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700}>
            {formatMonthLabel(month)}
          </Typography>
          <IconButton aria-label="Next month" onClick={() => shiftMonth(1)}>
            <ChevronRightIcon />
          </IconButton>
        </Stack>

        {loading ? (
          <Box sx={{ p: 4 }}>
            <PageStateLoader label="Loading calendar..." />
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: 1,
                mb: 1,
              }}
            >
              {WEEKDAYS.map((day) => (
                <Typography
                  key={day}
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  textAlign="center"
                >
                  {day}
                </Typography>
              ))}
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: 1,
              }}
            >
              {cells.map((date, index) => {
                if (!date) {
                  return <Box key={`empty-${index}`} sx={{ minHeight: 88 }} />;
                }

                const key = dateKey(date);
                const dayPosts = postsByDay.get(key) ?? [];
                const isSelected = selectedDay === key;
                const isToday = key === dateKey(new Date());

                return (
                  <Paper
                    key={key}
                    variant="outlined"
                    onClick={() => setSelectedDay(key)}
                    sx={{
                      minHeight: 88,
                      p: 1,
                      borderRadius: 2,
                      cursor: "pointer",
                      borderColor: isSelected ? "primary.main" : "divider",
                      bgcolor: isSelected ? "action.selected" : "background.paper",
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={isToday ? 800 : 600}
                      color={isToday ? "primary.main" : "text.primary"}
                    >
                      {date.getDate()}
                    </Typography>
                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                      {dayPosts.slice(0, 2).map((post) => (
                        <Chip
                          key={post.id}
                          label={post.status === "SCHEDULED" ? "Sched" : "Live"}
                          size="small"
                          color={post.status === "SCHEDULED" ? "default" : "success"}
                          sx={{ height: 20, fontSize: 10, maxWidth: "100%" }}
                        />
                      ))}
                      {dayPosts.length > 2 && (
                        <Typography variant="caption" color="text.secondary">
                          +{dayPosts.length - 2} more
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}
      </Card>

      <Card
        title={selectedDay ? `Posts — ${new Date(selectedDay).toLocaleDateString()}` : "Posts"}
        description="Is din ki scheduled / published posts"
      >
        {selectedPosts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Is din koi post nahi.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {selectedPosts.map((post) => (
              <Paper key={post.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" gap={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {post.contentPreview}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                      {post.scheduledFor
                        ? `Scheduled ${new Date(post.scheduledFor).toLocaleString()}`
                        : post.publishedAt
                          ? `Published ${new Date(post.publishedAt).toLocaleString()}`
                          : post.status}
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                      {post.platforms.map((platform) => (
                        <Chip
                          key={platform}
                          label={platformLabel(platform)}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                  <Chip label={post.status} size="small" variant="outlined" />
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Card>
    </Box>
  );
}
