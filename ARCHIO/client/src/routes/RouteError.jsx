import { isRouteErrorResponse, useRouteError } from 'react-router';
import PageHead from '../components/common/PageHead.jsx';
import Seo from '../components/common/Seo.jsx';
import Button from '../components/ui/Button.jsx';
import { ROUTES } from '../constants/routes.js';

export default function RouteError() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const title = status === 404 ? 'Not found' : 'Something went wrong';
  return (
    <PageHead title={title} size="md">
      {/* An outage page must not be indexed under the address it failed on. */}
      <Seo title={title} noindex description="This page could not be loaded." path={window.location.pathname} />
      <p className="t-lead prose">
        {status === 404
          ? 'We could not find that page.'
          : 'The page could not be loaded. If the site was just updated, reloading usually fixes it.'}
      </p>
      <div className="cluster">
        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Button to={ROUTES.home} variant="secondary">Back to home</Button>
      </div>
    </PageHead>
  );
}
