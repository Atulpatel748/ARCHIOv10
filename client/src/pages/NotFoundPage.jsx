import PageHead from '../components/common/PageHead.jsx';
import Seo from '../components/common/Seo.jsx';
import Button from '../components/ui/Button.jsx';
import { ROUTES } from '../constants/routes.js';

export function NotFoundContent({ what = 'page' }) {
  return (
    <div className="screen">
      <PageHead title="Not found">
        <p className="t-lead">We could not find that {what}. It may have moved or never existed.</p>
        <div className="cluster">
          <Button to={ROUTES.home}>Back to home</Button>
          <Button to={ROUTES.projects} variant="secondary">Browse projects</Button>
        </div>
      </PageHead>
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" noindex description="This page could not be found." path="/404" />
      <NotFoundContent />
    </>
  );
}
