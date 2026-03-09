const express = require('express');
const route = express.Router();

route.get('/form-select', (req, res, next) => {
    res.render('form-select', { subtitle: "Forms", title: "Select" });
});

route.get('/crm-estimations', (req, res, next) => {
    res.render('crm-estimations', { subtitle: "CRM", title: "Estimations" });
});

route.get('/charts-apex-timeline', (req, res, next) => {
    res.render('charts-apex-timeline', { subtitle: "Charts", title: "Timeline Apexchart" });
});

route.get('/ui-utilities', (req, res, next) => {
    res.render('ui-utilities', { subtitle: "UI", title: "Utilities" });
});

route.get('/sidebar-icon-view', (req, res, next) => {
    res.render('sidebar-icon-view', { title: "Icon View" });
});

route.get('/tables-datatables-fixed-header', (req, res, next) => {
    res.render('tables-datatables-fixed-header', { subtitle: "DataTables", title: "Fixed Header" });
});

route.get('/auth-sign-in', (req, res, next) => {
    res.render('auth-sign-in', { title: "Sign In" });
});

route.get('/chartjs-area', (req, res, next) => {
    res.render('chartjs-area', { subtitle: "Charts", title: "Area Charts" });
});

route.get('/sidebar-gray', (req, res, next) => {
    res.render('sidebar-gray', { title: "Gray Menu" });
});

route.get('/ui-videos', (req, res, next) => {
    res.render('ui-videos', { subtitle: "UI", title: "Videos" });
});

route.get('/ui-images', (req, res, next) => {
    res.render('ui-images', { subtitle: "UI", title: "Images" });
});

route.get('/topbar-light', (req, res, next) => {
    res.render('topbar-light', { title: "Light Topbar" });
});

route.get('/pages-faq', (req, res, next) => {
    res.render('pages-faq', { subtitle: "Pages", title: "FAQs" });
});

route.get('/charts-apex-line', (req, res, next) => {
    res.render('charts-apex-line', { subtitle: "Charts", title: "Line Apexchart" });
});

route.get('/crm-pipeline', (req, res, next) => {
    res.render('crm-pipeline', { subtitle: "CRM", title: "Pipeline" });
});

route.get('/chat', (req, res, next) => {
    res.render('chat', { subtitle: "Apps", title: "Chat" });
});

route.get('/misc-sortable', (req, res, next) => {
    res.render('misc-sortable', { title: "Sortable List", subtitle: "Miscellaneous" });
});

route.get('/invoices', (req, res, next) => {
    res.render('invoices', { subtitle: "Invoices", title: "Invoice List" });
});

route.get('/ui-scrollspy', (req, res, next) => {
    res.render('ui-scrollspy', { subtitle: "UI", title: "Scrollspy" });
});

route.get('/charts-apex-bubble', (req, res, next) => {
    res.render('charts-apex-bubble', { subtitle: "Charts", title: "Bubble Apexchart" });
});

route.get('/tables-datatables-fixed-columns', (req, res, next) => {
    res.render('tables-datatables-fixed-columns', { subtitle: "DataTables", title: "Fixed Columns" });
});

route.get('/sidebar-compact', (req, res, next) => {
    res.render('sidebar-compact', { title: "Compact Sidebar" });
});

route.get('/pages-pricing', (req, res, next) => {
    res.render('pages-pricing', { subtitle: "Pages", title: "Pricing" });
});

route.get('/icons-tabler', (req, res, next) => {
    res.render('icons-tabler', { subtitle: "Icons", title: "Tabler" });
});

route.get('/auth-2-reset-pass', (req, res, next) => {
    res.render('auth-2-reset-pass', { title: "Reset Password" });
});

route.get('/ecommerce-sellers', (req, res, next) => {
    res.render('ecommerce-sellers', { subtitle: "Ecommerce", title: "Sellers" });
});

route.get('/landing', (req, res, next) => {
    res.render('landing', { title: "One Page Landing" });
});

route.get('/misc-tree-view', (req, res, next) => {
    res.render('misc-tree-view', { subtitle: "Miscellaneous", title: "Treeview" });
});

route.get('/ui-accordions', (req, res, next) => {
    res.render('ui-accordions', { subtitle: "UI", title: "Accordions" });
});

route.get('/misc-clipboard', (req, res, next) => {
    res.render('misc-clipboard', { title: "Clipboard", subtitle: "Miscellaneous" });
});

route.get('/sidebar-offcanvas', (req, res, next) => {
    res.render('sidebar-offcanvas', { title: "Offcanvas Menu" });
});

route.get('/ticket-details', (req, res, next) => {
    res.render('ticket-details', { subtitle: "Support", title: "Tickets Details" });
});

route.get('/charts-apex-polar-area', (req, res, next) => {
    res.render('charts-apex-polar-area', { subtitle: "Charts", title: "Ploar Area Apexchart" });
});

route.get('/ecommerce-order-details', (req, res, next) => {
    res.render('ecommerce-order-details', { subtitle: "Ecommerce", title: "Order Details" });
});

route.get('/misc-pdf-viewer', (req, res, next) => {
    res.render('misc-pdf-viewer', { title: "PDF Viewer", subtitle: "Miscellaneous" });
});

route.get('/email-templates', (req, res, next) => {
    res.render('email-templates', { subtitle: "Email", title: "Email Templates" });
});

route.get('/auth-2-sign-in', (req, res, next) => {
    res.render('auth-2-sign-in', { title: "Sign In" });
});

route.get('/users-role-details', (req, res, next) => {
    res.render('users-role-details', { title: "Role Details" });
});

route.get('/sidebar-image', (req, res, next) => {
    res.render('sidebar-image', { title: "Image Menu" });
});

route.get('/ecommerce-add-product', (req, res, next) => {
    res.render('ecommerce-add-product', { subtitle: "Ecommerce", title: "Add Product" });
});

route.get('/ecommerce-seller-details', (req, res, next) => {
    res.render('ecommerce-seller-details', { subtitle: "Ecommerce", title: "Seller Details" });
});

route.get('/charts-apexsankey', (req, res, next) => {
    res.render('charts-apexsankey', { subtitle: "Charts", title: "Apex Sankey" });
});

route.get('/dashboard-2', (req, res, next) => {
    res.render('dashboard-2', { title: "Dashboard 2" });
});

route.get('/ui-pagination', (req, res, next) => {
    res.render('ui-pagination', { subtitle: "UI", title: "Pagination" });
});

route.get('/ui-popovers', (req, res, next) => {
    res.render('ui-popovers', { subtitle: "UI", title: "Popovers" });
});

route.get('/crm-deals', (req, res, next) => {
    res.render('crm-deals', { subtitle: "CRM", title: "Deals" });
});

route.get('/users-profile', (req, res, next) => {
    res.render('users-profile', { subtitle: "Users", title: "Profile" });
});

route.get('/ui-breadcrumb', (req, res, next) => {
    res.render('ui-breadcrumb', { subtitle: "UI", title: "Breadcrumb" });
});

route.get('/ui-grid', (req, res, next) => {
    res.render('ui-grid', { subtitle: "UI", title: "Grids" });
});

route.get('/api-keys', (req, res, next) => {
    res.render('api-keys', { subtitle: "Apps", title: "API Keys" });
});

route.get('/misc-i18', (req, res, next) => {
    res.render('misc-i18', { title: "i18 Support", subtitle: "Miscellaneous" });
});

route.get('/social-feed', (req, res, next) => {
    res.render('social-feed', { subtitle: "Apps", title: "Social Feed" });
});

route.get('/tables-custom', (req, res, next) => {
    res.render('tables-custom', { subtitle: "Pages", title: "Custom Tables" });
});

route.get('/tables-datatables-checkbox-select', (req, res, next) => {
    res.render('tables-datatables-checkbox-select', { subtitle: "DataTables", title: "Checkbox Select" });
});

route.get('/ecommerce-orders', (req, res, next) => {
    res.render('ecommerce-orders', { subtitle: "Ecommerce", title: "Orders" });
});

route.get('/charts-apex-range', (req, res, next) => {
    res.render('charts-apex-range', { subtitle: "Charts", title: "Range Apexcharts" });
});

route.get('/layouts-horizontal', (req, res, next) => {
    res.render('layouts-horizontal', { title: "Horizontal" });
});

route.get('/icons-lucide', (req, res, next) => {
    res.render('icons-lucide', { subtitle: "Icons", title: "Lucide" });
});

route.get('/layouts-compact', (req, res, next) => {
    res.render('layouts-compact', { title: "Compact" });
});

route.get('/tables-datatables-basic', (req, res, next) => {
    res.render('tables-datatables-basic', { subtitle: "Tables", title: "Basic" });
});

route.get('/error-401', (req, res, next) => {
    res.render('error-401', { title: "401 Error" });
});

route.get('/crm-opportunities', (req, res, next) => {
    res.render('crm-opportunities', { subtitle: "Apps", title: "Opportunities" });
});

route.get('/crm-campaign', (req, res, next) => {
    res.render('crm-campaign', { subtitle: "CRM", title: "Campaign" });
});

route.get('/auth-2-delete-account', (req, res, next) => {
    res.render('auth-2-delete-account', { title: "Delete Account" });
});

route.get('/ecommerce-reviews', (req, res, next) => {
    res.render('ecommerce-reviews', { subtitle: "Ecommerce", title: "Reviews" });
});

route.get('/auth-delete-account', (req, res, next) => {
    res.render('auth-delete-account', { title: "Delete Account" });
});

route.get('/sidebar-gradient', (req, res, next) => {
    res.render('sidebar-gradient', { title: "Gradient Menu" });
});

route.get('/crm-proposals', (req, res, next) => {
    res.render('crm-proposals', { subtitle: "CRM", title: "Proposals" });
});

route.get('/ecommerce-product-details', (req, res, next) => {
    res.render('ecommerce-product-details', { subtitle: "Ecommerce", title: "Product Details" });
});

route.get('/maintenance', (req, res, next) => {
    res.render('maintenance', { title: "Maintenance" });
});

route.get('/auth-lock-screen', (req, res, next) => {
    res.render('auth-lock-screen', { title: "Lock Screen" });
});

route.get('/calendar', (req, res, next) => {
    res.render('calendar', { subtitle: "Apps", title: "Calendar" });
});

route.get('/', (req, res, next) => {
    res.render('index', { title: "Dashboard" });
});

route.get('/index', (req, res, next) => {
    res.render('index', { title: "Dashboard" });
});

route.get('/charts-apex-scatter', (req, res, next) => {
    res.render('charts-apex-scatter', { subtitle: "Charts", title: "Scatter Apexchart" });
});

route.get('/tables-datatables-add-rows', (req, res, next) => {
    res.render('tables-datatables-add-rows', { subtitle: "DataTables", title: "Add Rows" });
});

route.get('/charts-apex-radialbar', (req, res, next) => {
    res.render('charts-apex-radialbar', { subtitle: "Charts", title: "RadialBar Apexchart" });
});

route.get('/form-pickers', (req, res, next) => {
    res.render('form-pickers', { subtitle: "Forms", title: "Pickers" });
});

route.get('/charts-apex-heatmap', (req, res, next) => {
    res.render('charts-apex-heatmap', { subtitle: "Charts", title: "Heatmap Apexchart" });
});

route.get('/auth-two-factor', (req, res, next) => {
    res.render('auth-two-factor', { title: "Two Factor Authentication" });
});

route.get('/tables-datatables-ajax', (req, res, next) => {
    res.render('tables-datatables-ajax', { subtitle: "DataTables", title: "Ajax" });
});

route.get('/crm-customers', (req, res, next) => {
    res.render('crm-customers', { subtitle: "CRM", title: "Customers" });
});

route.get('/tables-datatables-column-searching', (req, res, next) => {
    res.render('tables-datatables-column-searching', { subtitle: "DataTables", title: "Column Searching" });
});

route.get('/pages-sitemap', (req, res, next) => {
    res.render('pages-sitemap', { subtitle: "Pages", title: "Sitemap" });
});

route.get('/ui-notifications', (req, res, next) => {
    res.render('ui-notifications', { subtitle: "UI", title: "Notifications" });
});

route.get('/email-details', (req, res, next) => {
    res.render('email-details', { subtitle: "Apps", title: "Email" });
});

route.get('/ui-modals', (req, res, next) => {
    res.render('ui-modals', { subtitle: "UI", title: "Modals" });
});

route.get('/auth-new-pass', (req, res, next) => {
    res.render('auth-new-pass', { title: "New Password" });
});

route.get('/crm-activities', (req, res, next) => {
    res.render('crm-activities', { subtitle: "CRM", title: "Activities" });
});

route.get('/chartjs-line', (req, res, next) => {
    res.render('chartjs-line', { subtitle: "Charts", title: "Line Charts" });
});

route.get('/ui-cards', (req, res, next) => {
    res.render('ui-cards', { subtitle: "UI", title: "Cards" });
});

route.get('/auth-reset-pass', (req, res, next) => {
    res.render('auth-reset-pass', { title: "Reset Password" });
});

route.get('/users-permissions', (req, res, next) => {
    res.render('users-permissions', { subtitle: "Users", title: "Permissions" });
});

route.get('/ecommerce-categories', (req, res, next) => {
    res.render('ecommerce-categories', { subtitle: "Ecommerce", title: "Categories" });
});

route.get('/tables-datatables-javascript', (req, res, next) => {
    res.render('tables-datatables-javascript', { subtitle: "DataTables", title: "Javascript Source" });
});

route.get('/sidebar-dark', (req, res, next) => {
    res.render('sidebar-dark', { title: "Dark Menu" });
});

route.get('/ui-collapse', (req, res, next) => {
    res.render('ui-collapse', { subtitle: "UI", title: "Collapse" });
});

route.get('/auth-2-new-pass', (req, res, next) => {
    res.render('auth-2-new-pass', { title: "New Password" });
});

route.get('/ui-placeholders', (req, res, next) => {
    res.render('ui-placeholders', { subtitle: "UI", title: "Placeholders" });
});

route.get('/auth-success-mail', (req, res, next) => {
    res.render('auth-success-mail', { title: "Success Mail" });
});

route.get('/charts-apex-mixed', (req, res, next) => {
    res.render('charts-apex-mixed', { subtitle: "Charts", title: "Mixed Apexchart" });
});

route.get('/tables-datatables-columns', (req, res, next) => {
    res.render('tables-datatables-columns', { subtitle: "Datatables", title: "Show & Hide Columns" });
});

route.get('/form-wizard', (req, res, next) => {
    res.render('form-wizard', { subtitle: "Forms", title: "Wizard" });
});

route.get('/ticket-create', (req, res, next) => {
    res.render('ticket-create', { subtitle: "Support", title: "New Ticket" });
});

route.get('/charts-apex-pie', (req, res, next) => {
    res.render('charts-apex-pie', { subtitle: "Charts", title: "Pie Apexchart" });
});

route.get('/topbar-gray', (req, res, next) => {
    res.render('topbar-gray', { title: "Gray Topbar" });
});

route.get('/widgets', (req, res, next) => {
    res.render('widgets', { title: "Widgets" });
});

route.get('/maps-leaflet', (req, res, next) => {
    res.render('maps-leaflet', { subtitle: "Maps", title: "Leaflet" });
});

route.get('/charts-apex-bar', (req, res, next) => {
    res.render('charts-apex-bar', { subtitle: "Charts", title: "Bar Apexchart" });
});

route.get('/users-roles', (req, res, next) => {
    res.render('users-roles', { title: "User Roles" });
});

route.get('/email-compose', (req, res, next) => {
    res.render('email-compose', { subtitle: "Apps", title: "Email" });
});

route.get('/ui-tabs', (req, res, next) => {
    res.render('ui-tabs', { subtitle: "UI", title: "Tabs" });
});

route.get('/charts-apex-funnel', (req, res, next) => {
    res.render('charts-apex-funnel', { subtitle: "Charts", title: "Funnel Apexcharts" });
});

route.get('/form-other-plugins', (req, res, next) => {
    res.render('form-other-plugins', { subtitle: "Forms", title: "Other Plugins" });
});

route.get('/form-validation', (req, res, next) => {
    res.render('form-validation', { subtitle: "Forms", title: "Validation" });
});

route.get('/misc-tour', (req, res, next) => {
    res.render('misc-tour', { subtitle: "Miscellaneous", title: "Tour" });
});

route.get('/error-404', (req, res, next) => {
    res.render('error-404', { title: "404 Error" });
});

route.get('/charts-apex-column', (req, res, next) => {
    res.render('charts-apex-column', { subtitle: "Charts", title: "Column Apexchart" });
});

route.get('/ui-offcanvas', (req, res, next) => {
    res.render('ui-offcanvas', { subtitle: "UI", title: "Offcanvas" });
});

route.get('/misc-pass-meter', (req, res, next) => {
    res.render('misc-pass-meter', { title: "Password Meter", subtitle: "Miscellaneous" });
});

route.get('/charts-apextree', (req, res, next) => {
    res.render('charts-apextree', { subtitle: "Charts", title: "ApexTree" });
});

route.get('/chartjs-other', (req, res, next) => {
    res.render('chartjs-other', { subtitle: "Charts", title: "Other Charts" });
});

route.get('/ui-colors', (req, res, next) => {
    res.render('ui-colors', { subtitle: "UI", title: "Colors" });
});

route.get('/topbar-gradient', (req, res, next) => {
    res.render('topbar-gradient', { title: "Gradient Topbar" });
});

route.get('/charts-apex-treemap', (req, res, next) => {
    res.render('charts-apex-treemap', { subtitle: "Charts", title: "Treemap Apexchart" });
});

route.get('/ui-alerts', (req, res, next) => {
    res.render('ui-alerts', { subtitle: "UI", title: "Alerts" });
});

route.get('/tables-datatables-child-rows', (req, res, next) => {
    res.render('tables-datatables-child-rows', { subtitle: "DataTables", title: "Child Row" });
});

route.get('/charts-apex-slope', (req, res, next) => {
    res.render('charts-apex-slope', { subtitle: "Charts", title: "Slope Apexcharts" });
});

route.get('/email', (req, res, next) => {
    res.render('email', { subtitle: "Apps", title: "Email" });
});

route.get('/pages-terms-conditions', (req, res, next) => {
    res.render('pages-terms-conditions', { subtitle: "Pages", title: "Terms & Conditions" });
});

route.get('/pages-search-results', (req, res, next) => {
    res.render('pages-search-results', { subtitle: "Pages", title: "Search Results" });
});

route.get('/pages-coming-soon', (req, res, next) => {
    res.render('pages-coming-soon', { title: "Coming Soon!" });
});

route.get('/maps-vector', (req, res, next) => {
    res.render('maps-vector', { subtitle: "Maps", title: "Vector Maps" });
});

route.get('/form-elements', (req, res, next) => {
    res.render('form-elements', { subtitle: "Forms", title: "Basic Elements" });
});

route.get('/ui-links', (req, res, next) => {
    res.render('ui-links', { subtitle: "UI", title: "Links" });
});

route.get('/error-500', (req, res, next) => {
    res.render('error-500', { title: "500 Error" });
});

route.get('/ui-dropdowns', (req, res, next) => {
    res.render('ui-dropdowns', { subtitle: "UI", title: "Dropdowns" });
});

route.get('/crm-contacts', (req, res, next) => {
    res.render('crm-contacts', { subtitle: "CRM", title: "Contacts" });
});

route.get('/tables-datatables-range-search', (req, res, next) => {
    res.render('tables-datatables-range-search', { subtitle: "DataTables", title: "Range Search" });
});

route.get('/ui-spinners', (req, res, next) => {
    res.render('ui-spinners', { subtitle: "UI", title: "Spinners" });
});

route.get('/form-layouts', (req, res, next) => {
    res.render('form-layouts', { subtitle: "Forms", title: "Layouts" });
});

route.get('/ecommerce-customers', (req, res, next) => {
    res.render('ecommerce-customers', { subtitle: "Ecommerce", title: "Customers" });
});

route.get('/file-manager', (req, res, next) => {
    res.render('file-manager', { subtitle: "Apps", title: "File Manager" });
});

route.get('/sidebar-on-hover-active', (req, res, next) => {
    res.render('sidebar-on-hover-active', { title: "On Hover Active" });
});

route.get('/chartjs-bar', (req, res, next) => {
    res.render('chartjs-bar', { subtitle: "Charts", title: "Bar Charts" });
});

route.get('/tables-datatables-scroll', (req, res, next) => {
    res.render('tables-datatables-scroll', { subtitle: "Datatables", title: "Scroll" });
});

route.get('/form-range-slider', (req, res, next) => {
    res.render('form-range-slider', { subtitle: "Forms", title: "Range Slider" });
});

route.get('/layouts-preloader', (req, res, next) => {
    res.render('layouts-preloader', { title: "Preloader" });
});

route.get('/sidebar-on-hover', (req, res, next) => {
    res.render('sidebar-on-hover', { title: "On Hover Menu" });
});

route.get('/auth-2-login-pin', (req, res, next) => {
    res.render('auth-2-login-pin', { title: "Login with PIN" });
});

route.get('/auth-2-sign-up', (req, res, next) => {
    res.render('auth-2-sign-up', { title: "Create New Account" });
});

route.get('/tables-datatables-rendering', (req, res, next) => {
    res.render('tables-datatables-rendering', { subtitle: "Datatables", title: "Data Rendering" });
});

route.get('/form-fileuploads', (req, res, next) => {
    res.render('form-fileuploads', { subtitle: "Forms", title: "File Uploads" });
});

route.get('/ui-typography', (req, res, next) => {
    res.render('ui-typography', { subtitle: "UI", title: "Typography" });
});

route.get('/ui-badges', (req, res, next) => {
    res.render('ui-badges', { subtitle: "UI", title: "Badges" });
});

route.get('/crm-leads', (req, res, next) => {
    res.render('crm-leads', { subtitle: "CRM", title: "Leads" });
});

route.get('/users-contacts', (req, res, next) => {
    res.render('users-contacts', { subtitle: "Apps", title: "Contacts" });
});

route.get('/ui-tooltips', (req, res, next) => {
    res.render('ui-tooltips', { subtitle: "UI", title: "Tooltips" });
});

route.get('/error-400', (req, res, next) => {
    res.render('error-400', { title: "400 Error" });
});

route.get('/tables-datatables-select', (req, res, next) => {
    res.render('tables-datatables-select', { subtitle: "DataTables", title: "Select" });
});

route.get('/charts-apex-sparklines', (req, res, next) => {
    res.render('charts-apex-sparklines', { subtitle: "Charts", title: "Sparkline Apexcharts" });
});

route.get('/charts-apex-boxplot', (req, res, next) => {
    res.render('charts-apex-boxplot', { subtitle: "Charts", title: "Boxplot Apexchart" });
});

route.get('/auth-sign-up', (req, res, next) => {
    res.render('auth-sign-up', { title: "Create New Account" });
});

route.get('/auth-login-pin', (req, res, next) => {
    res.render('auth-login-pin', { title: "Login with Pin" });
});

route.get('/auth-2-success-mail', (req, res, next) => {
    res.render('auth-2-success-mail', { title: "Success Mail" });
});

route.get('/ui-buttons', (req, res, next) => {
    res.render('ui-buttons', { subtitle: "UI", title: "Buttons" });
});

route.get('/misc-sweet-alerts', (req, res, next) => {
    res.render('misc-sweet-alerts', { subtitle: "Miscellaneous", title: "SweetAlert2" });
});

route.get('/sidebar-with-lines', (req, res, next) => {
    res.render('sidebar-with-lines', { title: "Sidebar with Lines" });
});

route.get('/auth-2-lock-screen', (req, res, next) => {
    res.render('auth-2-lock-screen', { title: "Lock Screen" });
});

route.get('/sidebar-no-icons', (req, res, next) => {
    res.render('sidebar-no-icons', { title: "No Icons with Lines" });
});

route.get('/ecommerce-products', (req, res, next) => {
    res.render('ecommerce-products', { subtitle: "Ecommerce", title: "Products" });
});

route.get('/tables-static', (req, res, next) => {
    res.render('tables-static', { subtitle: "Tables", title: "Static Tables" });
});

route.get('/layouts-scrollable', (req, res, next) => {
    res.render('layouts-scrollable', { title: "Scrollable" });
});

route.get('/icons-flags', (req, res, next) => {
    res.render('icons-flags', { subtitle: "Icons", title: "Flags" });
});

route.get('/ecommerce-products-grid', (req, res, next) => {
    res.render('ecommerce-products-grid', { subtitle: "Ecommerce", title: "Products Grid" });
});

route.get('/tables-datatables-export-data', (req, res, next) => {
    res.render('tables-datatables-export-data', { subtitle: "Datatables", title: "Export Data" });
});

route.get('/layouts-boxed', (req, res, next) => {
    res.render('layouts-boxed', { title: "Boxed" });
});

route.get('/charts-apex-candlestick', (req, res, next) => {
    res.render('charts-apex-candlestick', { subtitle: "Charts", title: "Candlestick Apexchart" });
});

route.get('/charts-apex-radar', (req, res, next) => {
    res.render('charts-apex-radar', { subtitle: "Charts", title: "Radar Apexchart" });
});

route.get('/charts-apex-area', (req, res, next) => {
    res.render('charts-apex-area', { subtitle: "Charts", title: "Area Apexchart" });
});

route.get('/tickets-list', (req, res, next) => {
    res.render('tickets-list', { subtitle: "Support", title: "Tickets" });
});

route.get('/error-408', (req, res, next) => {
    res.render('error-408', { title: "408 Error" });
});

route.get('/pages-timeline', (req, res, next) => {
    res.render('pages-timeline', { subtitle: "Pages", title: "Timeline" });
});

route.get('/pages-empty', (req, res, next) => {
    res.render('pages-empty', { subtitle: "Pages", title: "Starter" });
});

route.get('/ui-carousel', (req, res, next) => {
    res.render('ui-carousel', { subtitle: "UI", title: "Carousel" });
});

route.get('/invoice-details', (req, res, next) => {
    res.render('invoice-details', { subtitle: "Invoices", title: "Invoice Details" });
});

route.get('/auth-2-two-factor', (req, res, next) => {
    res.render('auth-2-two-factor', { title: "Two Factor Authentication" });
});

route.get('/error-403', (req, res, next) => {
    res.render('error-403', { title: "403 Error" });
});

route.get('/form-text-editors', (req, res, next) => {
    res.render('form-text-editors', { subtitle: "Forms", title: "Text Editors" });
});

route.get('/ui-list-group', (req, res, next) => {
    res.render('ui-list-group', { subtitle: "UI", title: "List Group" });
});

route.get('/invoice-create', (req, res, next) => {
    res.render('invoice-create', { subtitle: "Invoices", title: "Create Invoice" });
});

route.get('/ui-progress', (req, res, next) => {
    res.render('ui-progress', { subtitle: "UI", title: "Progress" });
});


module.exports = route;