/** Default props factory for `DeleteConfirmModal` tests (reset mocks in `beforeEach`). */
export function deleteConfirmModalDefaultProps() {
  return {
    employeeName: "Jane Doe",
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    loading: false,
  };
}
