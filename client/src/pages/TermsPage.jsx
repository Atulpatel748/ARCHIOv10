import PageHead from '../components/common/PageHead.jsx';
import Seo from '../components/common/Seo.jsx';
import { ROUTES } from '../constants/routes.js';
import { SITE } from '../constants/site.js';

const SECTIONS = [
  {
    title: 'Introduction',
    text: `These terms and conditions govern the use of the ${SITE.name} website and the submission of design inquiries through the contact form. By using this website, you agree to these terms.`,
  },
  {
    title: 'Use of the website',
    text: `This website is provided for informational and inquiry purposes only. You agree to use it lawfully and not to misuse, interfere with, or attempt to compromise the website or any associated services.`,
  },
  {
    title: 'Inquiries and project discussions',
    text: `Any inquiry submitted through the website is sent by email to the studio. We may use the information you provide to assess whether we can assist with your project, to respond to your request, and to discuss a possible scope of work. We do not guarantee that we will accept a project or that we will respond to every inquiry. If we do not proceed with your inquiry, it may be deleted in line with our Privacy notice.`,
  },
  {
    title: 'Intellectual property',
    text: `All content on this website, including text, images, layouts, and branding, is owned by ${SITE.name} or used with permission. You may not reproduce, distribute, or use any content from this website without prior written permission.`,
  },
  {
    title: 'No warranties',
    text: `The website is provided on an “as is” basis. While we aim for accuracy and reliability, we do not warrant that the website will be uninterrupted, error-free, or free from defects. We do not guarantee that the content will always be current or complete.`,
  },
  {
    title: 'Limitation of liability',
    text: `To the extent permitted by applicable law, ${SITE.name} shall not be liable for any loss, damage, or inconvenience arising from the use of this website or from reliance on information contained within it, including indirect or consequential losses.`,
  },
  {
    title: 'Privacy and data protection',
    text: `We process inquiries in line with our Privacy notice and applicable data-protection laws. By submitting an inquiry, you agree to the collection and use of your information as described there.`,
  },
  {
    title: 'Governing law',
    text: `These terms are governed by the laws of the United Arab Emirates, without regard to conflict-of-law principles.`,
  },
  {
    title: 'Contact',
    text: `Questions about these terms can be sent to ${SITE.email}.`,
  },
];

export default function TermsPage() {
  return (
    <>
      <Seo
        title="Terms of service"
        description={`Terms and conditions for using the ${SITE.name} website and submitting an inquiry.`}
        path={ROUTES.terms}
      />
      <div className="screen">
      <PageHead title="Terms of service" size="md" />
      <div className="container section--tight">
        <div className="prose stack--lg">
          {SECTIONS.map((section) => (
            <section key={section.title} className="stack--sm">
              <h2 className="t-h3">{section.title}</h2>
              <p>{section.text}</p>
            </section>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
