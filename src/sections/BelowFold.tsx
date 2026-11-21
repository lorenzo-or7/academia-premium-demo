import { Space } from './Space'
import { Finder } from './Finder'
import { Membership } from './Membership'
import { Schedule } from './Schedule'
import { Stories } from './Stories'
import { Book } from './Book'
import { FinalCta } from './FinalCta'
import { Footer } from './Footer'

export default function BelowFold() {
  return (
    <>
      <Space />
      <Finder />
      <Membership />
      <Schedule />
      <Stories />
      <Book />
      <FinalCta />
      <Footer />
    </>
  )
}
