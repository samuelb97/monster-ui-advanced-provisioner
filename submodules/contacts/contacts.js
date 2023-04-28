define(function(require) {
	var $ = require('jquery'),
		_ = require('lodash'),
		Papa = require('papaparse'),
		monster = require('monster'),
		footable = require('footable');

	require('file-saver');

	var contactList = {
		subscribe: {
			'provisioner.contactList.render': '_contactListRender'
		},

		/**
		 * Render Contact List tab
		 * @param {Object} args
		 * @param {Object} args.container
		 */
		_contactListRender: function(args) {
			var self = this,
				initTemplate = function(directoryNames) {
					var contacts = self.appFlags.contactList,
						isDirectoryNamesDisplayed = _.get(directoryNames, 'settings.preferences.display.directory_names', false),
						template = $(self.getTemplate({
							name: 'contactList',
							data: {
								isDirectoryNamesDisplayed: isDirectoryNamesDisplayed
							},
							submodule: 'contacts'
						})),
						rows = _.map(contacts, function(contact) {
							return self.contactGetListItemRow(
								_.assign({}, args, {
									data: {
										contact: contact
									}
								})
							);
						});

					self.renderContactsTable({
						template: template,
						rows: rows
					});
					monster.ui.tooltips(template);

					self.contactListBindEvents(template, args);

					return template;
				},
				requests = {
					contacts: function(callback) {
						self.contactListGetContacts({
							success: function() {
								callback(null);
							},
							error: function(error) {
								callback(error, []);
							}
						});
					},
					directoryNames: function(callback) {
						self.contactListGetDisplayDirectoryNames({
							success: function(data) {
								callback(null, data);
							},
							error: function(error) {
								callback(error, []);
							}
						});
					}
				};

			monster.ui.insertTemplate(args.container, function(insertTemplateCallback) {
				monster.parallel(requests, function(error, results) {
					if (error) {
						monster.ui.toast({
							type: 'error',
							message: self.i18n.active().provisionerApp.toastr.error.getContactList
						});
					}

					var directoryNames = _.get(results, 'directoryNames');
					insertTemplateCallback(initTemplate(directoryNames));
				});
			});
		},

		renderContactsTable: function(args) {
			var self = this,
				defaultPageSize = _.get(args, 'defaultPageSize', 10),
				availablePageSizes = _.get(args, 'availablePageSizes', [ 5, 10, 25, 50, 100, 200, 600 ]),
				currentPage = _.get(args, 'currentPage', 1),
				template = _.get(args, 'template'),
				rows = _.get(args, 'rows');
			monster.ui.footable(
				template.find('#contact_list_table'),
				{
					paging: {
						current: currentPage,
						size: defaultPageSize,
						availablePageSizes: availablePageSizes
					},
					rows: rows
				}
			);
		},

		/**
		 * Returns contact list item template row
		 * @param {Object} args
		 * @param {Object} args.data Contact element data
		 */
		contactGetListItemRow: function(args) {
			var self = this,
				contactsLength = _.get(self.appFlags, 'contactList.length'),
				initTemplate = function initTemplate() {
					var template = $(self.getTemplate({
						name: 'contactListItem',
						data: _.merge({}, args.data, {
							isLast: contactsLength === args.data.index
						}),
						submodule: 'contacts'
					}));

					return template;
				};
			return initTemplate();
		},

		/**
		 * Render dialog form to create or edit a new contact for the contact list
		 * @param {Object} args
		 * @param {Number} args.contactIndex Current contact index when is edited
		 * @param {'create' | 'edit'} args.actionType Action triggered when the popup is rendered
		 */
		contactListRenderDialog: function(args) {
			var self = this,
				contactList = self.appFlags.contactList,
				contactIndex = args.contactIndex,
				actionType = args.actionType,
				dialogTemplate = $(self.getTemplate({
					name: 'contactListForm',
					data: _.merge({},
						_.find(contactList, { index: contactIndex }),
						{
							isEdit: actionType === 'edit'
						}),
					submodule: 'contacts'
				})),
				popupTitle = _.get(self.i18n.active().provisionerApp.contactList.popup, actionType),
				popup = monster.ui.dialog(dialogTemplate, {
					title: popupTitle
				});

			monster.ui.validate(dialogTemplate.find('#save_contacts'), {
				rules: {
					'index': {
						min: 1
					},
					'label': {
						required: true
					},
					'value': {
						required: true
					}
				}
			});

			self.contactListPopupBindEvents(dialogTemplate, {
				popup: popup,
				contactIndex: contactIndex,
				isEdit: actionType === 'edit'
			});
		},
		/**
		 * Save and update the contact list data from a CSV file
		 * @param {Array} csvContacts csv data formatted
		 */
		contactListSaveListFromCsv: function(contactList) {
			var self = this;

			// Update contact List
			self.contactListUpdateContacts({
				data: contactList,
				success: function(data) {
					var contacts = _.get(data, 'contact_list', []);

					self.appFlags.contactList = contacts;
					monster.ui.loadTab(self, 'contacts_list');
				},
				error: function(error) {
					monster.ui.toast({
						type: 'error',
						message: self.i18n.active().provisionerApp.toastr.error.updateContactList
					});
				}
			});
		},
		/**
		 * Bind contact list events
		 * @param {jQuery} template Contact list template
		 */
		contactListBindEvents: function(template) {
			var self = this,
				csvHeader = ['label', 'value', 'account'];

			template
				.on('click', '.contact-action', function(event) {
					event.preventDefault();

					var $this = $(this),
						actionType = $this.data('action'),
						contactRow = $this.parents('tr'),
						contactIndex = _.parseInt(contactRow.data('index'));

					if (actionType === 'create' || actionType === 'edit') {
						self.contactListRenderDialog({
							contactIndex: contactIndex,
							actionType: actionType
						});
					} else {
						monster.ui.confirm(self.i18n.active().provisionerApp.alert.confirm.deleteContact, function() {
							var matchesContactToDelete = _.flow(
									_.partial(_.get, _, 'index'),
									_.partial(_.isEqual, contactIndex)
								),
								normalizeIndex = function(contact, idx) {
									return _.merge({}, contact, {
										index: idx + 1
									});
								},
								updatedContactList = _
									.chain(self.appFlags.contactList)
									.reject(matchesContactToDelete)
									.map(normalizeIndex)
									.value();

							// Update contact List
							self.contactListUpdateContacts({
								data: updatedContactList,
								success: function(data) {
									var tableTemplate = template.find('#contact_list_table'),
										contacts = _.get(data, 'contact_list', []);

									self.appFlags.contactList = contacts;
									self.renderUpdatedContactList({
										template: tableTemplate,
										updatedContactIndex: contactIndex
									});
								},
								error: function(error) {
									monster.ui.toast({
										type: 'error',
										message: self.i18n.active().provisionerApp.toastr.error.updateContactList
									});
								}
							});
						});
					}
				});

			template
				.find('.import-csv')
					.on('click', function() {
						monster.pub('common.csvUploader.renderPopup', {
							title: self.i18n.active().provisionerApp.contactList.popup.importCsv,
							header: csvHeader,
							row: {
								extractor: function(entry, idx) {
									var defaults = {
											account: 1,
											value: ''
										},
										indexData = {
											index: idx + 1
										},
										contactData = _.reduce(csvHeader, function(acc, columnHead, columnIdx) {
											return _.merge(_.set({}, columnHead, entry[columnIdx]), acc);
										}, {});

									return _.merge({}, defaults, contactData, indexData);
								},
								sanitizer: function(entry) {
									return {
										index: _.toNumber(entry.index),
										label: _.toString(entry.label),
										value: _.toString(entry.value),
										account: _.toNumber(entry.account)
									};
								},
								validator: _.flow(
									_.partial(_.get, _, 'label'),
									_.negate(_.isEmpty)
								)
							},
							onSuccess: _.bind(self.contactListSaveListFromCsv, self)
						});
					});

			template
				.find('.export-csv')
					.on('click', function() {
						var formatData = _.partial(_.map, _, _.partial(_.pick, _, ['label', 'value', 'account'])),
							getBlobFromCsv = function(csv) {
								return new Blob([csv], {
									type: 'text/csv;chartset=utf-8'
								});
							},
							saveContactsAsCvs = _.flow(
								formatData,
								Papa.unparse,
								getBlobFromCsv,
								_.partial(saveAs, _, self.appFlags.exportFileName + '.csv')
							);

						saveContactsAsCvs(self.appFlags.contactList);
					});

			template
				.on('click', '.inline-index-action', function() {
					var $this = $(this),
						updatedContactList = _.cloneDeep(self.appFlags.contactList),
						actionType = $this.data('action-type'),
						rowItem = $this.parents('tr'),
						itemIndex = rowItem.data('index'),
						newIndex;

					if (actionType === 'up') {
						newIndex = itemIndex - 1;
					} else {
						newIndex = itemIndex + 1;
					}

					var currentItem = _.find(updatedContactList, { index: newIndex }),
						oldItem = _.find(updatedContactList, { index: itemIndex });

					//Swipe indexes
					_.merge(currentItem, {
						index: _.parseInt(itemIndex)
					});

					_.merge(oldItem, {
						index: _.parseInt(newIndex)
					});

					// Update contact List
					self.contactListUpdateContacts({
						data: updatedContactList,
						success: function(data) {
							var tableTemplate = template.find('#contact_list_table'),
								contacts = _.get(data, 'contact_list', []);
							self.appFlags.contactList = contacts;

							self.renderUpdatedContactList({
								template: tableTemplate,
								updatedContactIndex: newIndex
							});
						},
						error: function(error) {
							monster.ui.toast({
								type: 'error',
								message: self.i18n.active().provisionerApp.toastr.error.updateContactList
							});
						}
					});
				});

			template
				.find('#displayDirectoryNames')
					.on('change', function() {
						var $this = $(this),
							formattedData = {
								generate: true,
								merge: true,
								data: _.set({}, 'settings.preferences.display.directory_names', $this.is(':checked'))
							};

						$this.prop('disabled', true);

						self.contactListUpdateDisplayDirectoryNames({
							data: formattedData,
							success: function(data) {
								$this.prop('disabled', false);
							},
							error: function(error) {
								monster.ui.toast({
									type: 'error',
									message: self.i18n.active().provisionerApp.toastr.error.updateDisplayDirectoryNames
								});
							}
						});
					});
		},
		/**
		 * Bind contact list form dialog
		 * @param {jQuery} template Dialog template
		 * @param {Object} args
		 * @param {jQuery} args.popup Dialog instance
		 * @param {Number} args.contactIndex Current contant index when a contact is edited
		 * @param {Boolean} args.isEdit Whether the current contact is edited
		 */
		contactListPopupBindEvents: function(template, args) {
			var self = this,
				popup = args.popup;

			template
				.find('#save_contacts')
					.on('submit', function(e) {
						e.preventDefault();
						var $this = $(this);

						if (!monster.ui.valid($this)) {
							return;
						}

						var formData = monster.ui.getFormData('save_contacts'),
							formattedFormData = _.merge({}, formData, {
								account: formData.account ? formData.account : 1
							}),
							contactCurrentIndex = args.contactIndex,
							updatedContactList = _.cloneDeep(self.appFlags.contactList),
							// Helpers when editing a contact
							existingContact = _.find(updatedContactList, { index: _.parseInt(formattedFormData.index) }),
							editedContact = _.find(updatedContactList, { index: _.parseInt(contactCurrentIndex) }),
							updatedIndex = function(index, length) {
								return (index > length) ? length : index;
							};

						if (existingContact && args.isEdit) {
							// Swipe indexes when the index is assing to an axisting one
							if (contactCurrentIndex !== formattedFormData.index) {
								_.merge(existingContact, {
									index: _.parseInt(editedContact.index)
								});
							}

							_.merge(editedContact, formattedFormData, {
								index: _.parseInt(formattedFormData.index)
							});
						} else {
							// Check if the assigned index already exists, to re order the contact list
							if (existingContact) {
								//  Insert contact at the existing position
								updatedContactList.splice(formattedFormData.index - 1, 0, formattedFormData);

								// Re order contact list
								_.each(updatedContactList, function(contact, index) {
									contact.index = index + 1;
								});
							} else {
								updatedContactList.push(_.merge({}, formattedFormData, {
									index: updatedContactList.length + 1
								}));
							}
						}

						self.contactListUpdateContacts({
							data: updatedContactList,
							success: function(data) {
								var tableTemplate = template.parent().parent().parent().find('#contact_list_table');
								self.appFlags.contactList = _.get(data, 'contact_list', []);
								self.renderUpdatedContactList({
									template: tableTemplate,
									updatedContactIndex: updatedIndex(formattedFormData.index, updatedContactList.length)
								});

								popup.dialog('close');
							},
							error: function(error) {
								monster.ui.toast({
									type: 'error',
									message: self.i18n.active().provisionerApp.toastr.error.updateContactList
								});
							}
						});
					});
		},

		renderUpdatedContactList: function(args) {
			var self = this,
				tableTemplate = _.get(args, 'template'),
				updatedContactIndex = _.get(args, 'updatedContactIndex'),
				currentPageSize = tableTemplate.find('.table-page-size select').val(),
				pageCount = tableTemplate.find('.pagination').find('.visible').length,
				calculateItemPage = function(itemIndex, pageCount, pageSize) {
					if (!itemIndex) {
						return pageCount;
					}
					var itemPage = pageCount;
					for (var i = 1; i <= pageCount; i++) {
						if (itemIndex <= (i * pageSize)) {
							itemPage = i;
							break;
						}
					}
					return itemPage;
				},
				getdisplayPage = _.partial(calculateItemPage, updatedContactIndex, pageCount, currentPageSize),
				table = footable.get(tableTemplate),
				rows = _.map(self.appFlags.contactList, function(contact) {
					return self.contactGetListItemRow(
						_.assign({}, args, {
							data: {
								contact: contact
							}
						})
					);
				});

			table.rows.load(rows);
			table.gotoPage(getdisplayPage());
		},
		/**
		 * Get the contact list
		 * @param {Object} args
		 * @param {Object} args.data Request data
		 * @param {Callback} args.success Invoked when the request is successful
		 * @param {Callback} args.error Invoked when the request is failed
		 */
		contactListGetContacts: function(args) {
			var self = this;

			monster.request({
				resource: 'provisioner.contactList.get',
				data: _.merge({
					accountId: self.accountId
				}, args.data),
				success: function(data, status) {
					self.appFlags.contactList = _.get(data, 'data.contact_list', []);

					args.hasOwnProperty('success') && args.success(data.data);
				},
				error: function(parsedError, error) {
					if (error.status === 404) {
						_.has(args, 'success') && args.success({});
					} else {
						_.has(args, 'error') && args.error(parsedError);
					}
				}
			});
		},
		/**
		 * Get the display directory names config
		 * @param {Object} args
		 * @param {Callback} args.success Invoked when the request is successful
		 * @param {Callback} args.error Invoked when the request is failed
		 */
		contactListGetDisplayDirectoryNames: function(args) {
			var self = this;

			monster.request({
				resource: 'provisioner.directoryNames.get',
				data: _.merge({
					accountId: self.accountId
				}, {
					//temporary set default brand
					brand: self.appFlags.displayContactNamesBrand
				}, args.data),
				success: function(data, status) {
					args.hasOwnProperty('success') && args.success(data.data);
				},
				error: function(parsedError, error) {
					if (error.status === 404) {
						_.has(args, 'success') && args.success({});
					} else {
						_.has(args, 'error') && args.error(parsedError);
					}
				}
			});
		},
		/**
		 * Update the contact list
		 * @param {Object} args
		 * @param {Object} [args.data] Request data
		 * @param {Callback} args.success Invoked when the request is successful
		 * @param {Callback} args.error Invoked when the request is failed
		 */
		contactListUpdateContacts: function(args) {
			var self = this,
				contactList = _.get(args, 'data', self.appFlags.contactList);

			monster.request({
				resource: 'provisioner.contactList.update',
				data: {
					accountId: self.accountId,
					data: {
						'contact_list': contactList
					}
				},
				success: function(data, status) {
					args.hasOwnProperty('success') && args.success(data.data);
				},
				error: function(parsedError) {
					args.hasOwnProperty('error') && args.error(parsedError);
				}
			});
		},
		/**
		 * Update the display directory names config
		 * @param {Object} args
		 * @param {Object} args.data Request data
		 * @param {Callback} args.success Invoked when the request is successful
		 * @param {Callback} args.error Invoked when the request is failed
		 */
		contactListUpdateDisplayDirectoryNames: function(args) {
			var self = this;

			monster.request({
				resource: 'provisioner.directoryNames.update',
				data: _.merge({
					accountId: self.accountId
				}, {
					//temporary set default brand
					brand: self.appFlags.displayContactNamesBrand
				}, args.data),

				success: function(data, status) {
					args.hasOwnProperty('success') && args.success(data.data);
				},
				error: function(parsedError, error) {
					_.has(args, 'error') && args.error(parsedError);
				}
			});
		}
	};

	return contactList;
});
