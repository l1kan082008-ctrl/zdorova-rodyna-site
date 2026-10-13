# Homepage popular services

The homepage ranks priced services by submitted bookings from the last 30 days.
Statuses `new`, `contacted`, `confirmed` and `closed` count; `cancelled` does not.
Callback and family-declaration requests do not count as procedure selections.
The rolling window is based on the booking creation date and includes all records
in the window, without a last-500-record cutoff.

For a calculator booking, the structured selected-study list is authoritative.
The existing parser also reads unambiguous older flattened lists. The free-text
patient comment is not searched for service names. Repeated study names within a
booking count once; CITO labels are removed and the urgency surcharge is skipped.
For other bookings, the service field supplies the selected names.

Names are matched to active catalogue entries, using current names, saved aliases
and known price references. Counts for aliases of the same price item are added
before sorting. Ambiguous general requests such as “МРТ” are not assigned to an
arbitrary exam. Published cards contain only catalogue titles, categories and
current prices, never booking text or patient details.

Up to eight cards are shown, ordered by count with stable alphabetical ties.
If there are fewer matching services, the existing fallback selection fills the
remaining slots. The homepage is dynamically rendered, so a fresh page request
recalculates the list; an already-open page does not poll for updates. Changes to
counts can leave the visible order unchanged. Failed statistics reads keep the
fallback and emit only the `popular_booking_services_load_failed` event.

Regression checks: `node --test tests/booking-storage.test.mjs tests/booking-details.test.mjs tests/popular-services.test.mjs`.
These tests use synthetic data and an in-memory database, without external mail
or production booking access.
