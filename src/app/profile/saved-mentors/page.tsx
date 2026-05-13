import { redirect } from 'next/navigation'

export default function SavedMentorsRedirect() {
  redirect('/bookmarks?tab=mentors')
}
